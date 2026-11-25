import { copyFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const clientOutDir = resolve("dist", "client");
const indexPath = resolve(clientOutDir, "index.html");
const fallbackPath = resolve(clientOutDir, "404.html");

await stat(indexPath);
await copyFile(indexPath, fallbackPath);
