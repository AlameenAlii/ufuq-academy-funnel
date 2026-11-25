// Makes the built static site work on ANY domain or subdomain, and makes the
// WhatsApp/Facebook/X link preview reliable.
//
// Why this exists
// ---------------
// Social crawlers (WhatsApp included) do NOT run JavaScript. They read the raw
// HTML and they require og:image to be an ABSOLUTE https URL. The build bakes
// in whatever domain it knew about, so if that domain is not the one you
// deployed to, the text still shows (og:title/og:description are just strings)
// but the image 404s - exactly the "text loads, picture doesn't" symptom.
//
// What it does, over every built .html/.xml/.txt/.js file:
//   1. Rewrites the baked origin to your real origin.
//   2. Hoists <title> and all og:/twitter:/canonical tags to the very top of
//      <head>, because WhatsApp parses only the first chunk of the document
//      and gives up once it has scanned enough bytes. That is why the text
//      only appeared after pasting the link a few times.
//   3. Stamps a cache-busting ?v= on the og:image URLs, so WhatsApp cannot
//      serve you a previously failed fetch from its cache.
//   4. Records the origin it wrote in `.site-url`, so a later run can find
//      and replace it again.
//
// Usage
//   npm run set-site-url -- https://courses.example.com
//   node scripts/set-site-url.mjs https://courses.example.com [outDir]
//   SITE_URL=https://courses.example.com npm run build
//
// Safe to re-run on an already-built folder as often as you like: moving the
// site to another domain needs no rebuild, just another run.

import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

/** The origin the app is compiled with (see vite.config.ts / src/lib/seo.ts). */
const BAKED_ORIGIN = "https://example.com";

const REWRITABLE = new Set([".html", ".htm", ".xml", ".txt", ".js", ".json", ".webmanifest"]);

const CANDIDATE_DIRS = [join("dist", "client"), join(".output", "public"), "dist", "build"];

function normalizeOrigin(value) {
  const trimmed = String(value).trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error(`Site URL must start with http:// or https:// - got "${value}"`);
  }
  if (trimmed.startsWith("http://")) {
    console.warn(
      "[set-site-url] Warning: WhatsApp will not fetch preview images over plain http. Use https.",
    );
  }
  return trimmed;
}

async function resolveOutDir(explicit) {
  if (explicit) {
    const dir = resolve(explicit);
    await stat(dir);
    return dir;
  }
  for (const candidate of CANDIDATE_DIRS) {
    const dir = resolve(candidate);
    if (existsSync(join(dir, "index.html"))) return dir;
  }
  throw new Error(
    `Could not find a build output folder. Looked in: ${CANDIDATE_DIRS.join(", ")}. Run "npm run build" first, or pass the folder as the second argument.`,
  );
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

function extension(path) {
  const dot = path.lastIndexOf(".");
  return dot === -1 ? "" : path.slice(dot).toLowerCase();
}

/**
 * Pull <title>, og:*, twitter:* and rel=canonical out of <head> and put them
 * back immediately after <head>, so a crawler that reads only the first few
 * kilobytes still sees the whole preview payload.
 */
function hoistPreviewTags(html) {
  const headOpen = html.match(/<head[^>]*>/i);
  if (!headOpen) return html;

  const headStart = html.indexOf(headOpen[0]) + headOpen[0].length;
  const headEnd = html.toLowerCase().indexOf("</head>");
  if (headEnd === -1 || headEnd <= headStart) return html;

  const before = html.slice(0, headStart);
  let head = html.slice(headStart, headEnd);
  const rest = html.slice(headEnd);

  const patterns = [
    /<meta[^>]+charset=[^>]*>/gi,
    /<title[^>]*>[\s\S]*?<\/title>/gi,
    /<meta[^>]+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+|description)["'][^>]*>/gi,
    /<link[^>]+rel=["']canonical["'][^>]*>/gi,
  ];

  const hoisted = [];
  for (const pattern of patterns) {
    const found = head.match(pattern);
    if (!found) continue;
    for (const tag of found) {
      hoisted.push(tag);
      head = head.replace(tag, "");
    }
  }

  if (hoisted.length === 0) return html;

  // Dedupe while keeping order: charset, then title, then the cards.
  const seen = new Set();
  const unique = hoisted.filter((tag) => {
    const key = tag.replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return `${before}\n${unique.join("\n")}\n${head.replace(/^\s*\n/, "")}${rest}`;
}

/** Append ?v=<stamp> to og:image / twitter:image URLs to defeat stale caches. */
function stampImages(html, stamp) {
  return html.replace(
    /(<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]*content=["'])([^"']+)(["'])/gi,
    (_match, head, url, tail) => {
      const clean = url.replace(/([?&])v=[^&]*/g, "$1").replace(/[?&]$/, "");
      const joiner = clean.includes("?") ? "&" : "?";
      return `${head}${clean}${joiner}v=${stamp}${tail}`;
    },
  );
}

async function main() {
  const target = process.argv[2] || process.env.SITE_URL || process.env.VITE_SITE_URL;
  const outDirArg = process.argv[3];

  if (!target) {
    console.log(
      "[set-site-url] No site URL given, leaving the built URLs as they are.\n" +
        "               Run: npm run set-site-url -- https://your-domain.com",
    );
    return;
  }

  const origin = normalizeOrigin(target);
  const outDir = await resolveOutDir(outDirArg);
  const markerPath = join(outDir, ".site-url");

  // Whatever origin is in the files right now: the baked one, or the one a
  // previous run of this script wrote.
  const previous = existsSync(markerPath)
    ? (await readFile(markerPath, "utf8")).trim().replace(/\/+$/, "")
    : "";
  const origins = [...new Set([previous, BAKED_ORIGIN].filter(Boolean))];

  const stamp = Date.now().toString(36);
  const files = await walk(outDir);
  let rewritten = 0;
  let hoistedFiles = 0;

  for (const file of files) {
    const ext = extension(file);
    if (!REWRITABLE.has(ext)) continue;

    const original = await readFile(file, "utf8");
    let next = original;

    for (const from of origins) {
      if (from !== origin) next = next.split(from).join(origin);
    }

    if (ext === ".html" || ext === ".htm") {
      const before = next;
      next = stampImages(hoistPreviewTags(next), stamp);
      if (next !== before) hoistedFiles += 1;
    }

    if (next !== original) {
      await writeFile(file, next, "utf8");
      rewritten += 1;
    }
  }

  await writeFile(markerPath, `${origin}\n`, "utf8");

  console.log(`[set-site-url] Origin  : ${origin}`);
  console.log(`[set-site-url] Folder  : ${outDir}`);
  console.log(
    `[set-site-url] Updated : ${rewritten} file(s), preview tags hoisted in ${hoistedFiles}`,
  );
  console.log(
    `[set-site-url] Verify  : ${origin}/og/og-ar.jpg must open directly in a browser, over https, with no redirect.`,
  );
}

await main();
