// Bilingual routing core: Arabic is the default locale, English is the
// mirror. Every page exists at both `/ar/...` and `/en/...`, and the pair is
// linked with hreflang so the two never drift apart.

import { useLocation } from "@tanstack/react-router";

import ar from "./i18n/ar";
import en, { type Translations } from "./i18n/en";

export type { Translations };

export const LANGS = ["ar", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "ar";

export const LANG_TAGS: Record<Lang, string> = {
  ar: "ar-SA",
  en: "en",
};

export const OG_LOCALES: Record<Lang, string> = {
  ar: "ar_SA",
  en: "en_US",
};

export const LANG_NAMES: Record<Lang, string> = {
  ar: "العربية",
  en: "English",
};

export const LANG_STORAGE_KEY = "ufuq-lang";

export const PAGE_KEYS = [
  "home",
  "register",
  "admin",
  "terms",
  "privacy",
] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

/** Slug per page key. The home page has an empty slug. */
export const PAGE_SLUGS: Record<PageKey, string> = {
  home: "",
  register: "register",
  admin: "admin",
  terms: "terms-and-refunds",
  privacy: "privacy-policy",
};

const DICTS: Record<Lang, Translations> = { ar, en };

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

export function dirFor(lang: Lang): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}

export function otherLang(lang: Lang): Lang {
  return lang === "ar" ? "en" : "ar";
}

export function dict(lang: Lang): Translations {
  return DICTS[lang] ?? DICTS[DEFAULT_LANG];
}

/** `/ar`, `/ar/register`, `/en/admin` … always without a trailing slash. */
export function pagePath(lang: Lang, key: PageKey): string {
  const slug = PAGE_SLUGS[key];
  return slug ? `/${lang}/${slug}` : `/${lang}`;
}

/** Resolves a pathname back to a page key (defaults to the home page). */
export function pageKeyFromPath(pathname: string): PageKey {
  const segments = pathname.split("/").filter(Boolean);
  const slug = segments.slice(1).join("/");
  if (!slug) return "home";
  const match = (Object.keys(PAGE_SLUGS) as PageKey[]).find(
    (key) => PAGE_SLUGS[key] === slug,
  );
  return match ?? "home";
}

export function langFromPath(pathname: string): Lang {
  const first = pathname.split("/").filter(Boolean)[0];
  return isLang(first) ? first : DEFAULT_LANG;
}

/** The same page in the other locale — used by the language switcher. */
export function equivalentPath(pathname: string, target: Lang): string {
  return pagePath(target, pageKeyFromPath(pathname));
}

export function alternatePaths(key: PageKey): Record<Lang, string> {
  return {
    ar: pagePath("ar", key),
    en: pagePath("en", key),
  };
}

/**
 * Locale for a first-time visitor: a stored choice wins, then the browser
 * languages, then Arabic. Only ever called in the browser.
 */
export function detectInitialLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // Private mode or blocked storage: fall through to navigator languages.
  }
  const candidates = window.navigator.languages ?? [window.navigator.language];
  for (const candidate of candidates) {
    const base = candidate?.toLowerCase().split("-")[0];
    if (isLang(base)) return base;
  }
  return DEFAULT_LANG;
}

export function rememberLang(lang: Lang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Persisting the choice is a convenience, never a requirement.
  }
}

/** Keeps `<html lang>` / `<html dir>` in sync with the active route. */
export function applyHtmlLangAttrs(lang: Lang): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = LANG_TAGS[lang];
  document.documentElement.dir = dirFor(lang);
}

export function applyRouteLang(lang: Lang): void {
  applyHtmlLangAttrs(lang);
  rememberLang(lang);
}

export function usePathname(): string {
  return useLocation({ select: (location) => location.pathname });
}

export function useLang(): Lang {
  return langFromPath(usePathname());
}

export function useIsRtl(): boolean {
  return useLang() === "ar";
}

export function useDict(): Translations {
  return dict(useLang());
}

/** Builds a link to a page key in the currently active locale. */
export function useLocalizedPath(): (key: PageKey) => string {
  const lang = useLang();
  return (key: PageKey) => pagePath(lang, key);
}

/** Replaces %TOKEN% placeholders in dictionary strings. */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (text, [token, value]) => text.split(`%${token}%`).join(String(value)),
    template,
  );
}
