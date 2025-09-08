import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { build } from "esbuild";

// __dirname definieren
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "src");
const SCRIPTS_DIR = path.join(SRC_DIR, "scripts");
const ROUTES_DIR = path.join(SRC_DIR, "routes");

async function collectFiles(dir, filterFn) {
  const entries = await readdir(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await collectFiles(fullPath, filterFn));
    } else if (entry.isFile() && filterFn(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function collectFrontendFiles() {
  const scriptFiles = await collectFiles(SCRIPTS_DIR, (name) =>
    name.endsWith(".ts")
  );
  const routeFiles = await collectFiles(ROUTES_DIR, (name) =>
    name.endsWith("+page.ts")
  );
  return [...scriptFiles, ...routeFiles];
}

export async function buildAll() {
  const entryPoints = await collectFrontendFiles();

  await build({
    entryPoints,
    bundle: true,
    platform: "browser",
    format: "esm",
    outdir: path.join(__dirname, "public/src"),
    sourcemap: true,
  });
}
