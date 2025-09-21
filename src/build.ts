// src/build.ts

import path from "path";
import { context } from "esbuild";
import { log } from "console";
import { JazelKitConfig } from "./JazelKitConfig.js";
import { collectFiles } from "./helpers.js";

async function collectProjectFiles(
  SCRIPTS_DIR: string,
  ROUTES_DIR: string,
  MODULES_DIR: string
): Promise<string[]> {
  const scriptFiles = await collectFiles(SCRIPTS_DIR, (name) =>
    name.endsWith(".ts")
  );
  const routeFiles = await collectFiles(
    ROUTES_DIR,
    (name) => name.endsWith("+page.ts") || name.endsWith("+page.js")
  );
  const moduleFiles = await collectFiles(
    MODULES_DIR,
    (name) => name.endsWith(".ts") || name.endsWith(".js")
  );
  return [...scriptFiles, ...routeFiles, ...moduleFiles];
}

export async function buildAll(
  ROOT_DIR: string,
  SOURCE_DIR: string,
  MODULES_DIR: string,
  config: JazelKitConfig
) {
  const SCRIPTS_DIR = path.join(ROOT_DIR, "scripts");
  const ROUTES_DIR = path.join(ROOT_DIR, "routes");
  log("Scripts Dir:", SCRIPTS_DIR);
  log("Routes Dir:", ROUTES_DIR);
  log("Modules Dir:", MODULES_DIR);
  // Sammle alle .ts Dateien in den angegebenen Verzeichnissen
  const entryPoints = await collectProjectFiles(
    SCRIPTS_DIR,
    ROUTES_DIR,
    MODULES_DIR
  );
  log("Entry Points:", entryPoints);

  const ctx = await context({
    entryPoints,
    bundle: true,
    platform: "browser",
    format: "esm",
    outbase: ROOT_DIR,
    outdir: SOURCE_DIR,
    sourcemap: config.build?.sourcemap || false,
    minify: config.build?.minify || true,
  });

  await ctx.watch(); // aktiviert den Watch-Modus
}
