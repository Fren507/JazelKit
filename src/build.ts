// src/build.ts

import path from "path";
import { context } from "esbuild";
import { JazelKitConfig } from "./JazelKitConfig.js";
import { collectFiles } from "./helpers.js";

async function collectProjectFiles(
  SCRIPTS_DIR: string,
  ROUTES_DIR: string
): Promise<string[]> {
  const scriptFiles = await collectFiles(SCRIPTS_DIR, (name) =>
    name.endsWith(".ts")
  );
  const routeFiles = await collectFiles(
    ROUTES_DIR,
    (name) => name.endsWith("+page.ts") || name.endsWith("+page.js")
  );
  return [...scriptFiles, ...routeFiles];
}

async function collectModuleFiles(MODULES_DIR: string): Promise<string[]> {
  return collectFiles(
    MODULES_DIR,
    (name) => name.endsWith(".ts") || name.endsWith(".js")
  );
}

export async function buildAll(
  ROOT_DIR: string,
  SOURCE_DIR: string,
  MODULES_DIR: string,
  config: JazelKitConfig
) {
  const SCRIPTS_DIR = path.join(ROOT_DIR, "scripts");
  const ROUTES_DIR = path.join(ROOT_DIR, "routes");
  const entryPoints = await collectProjectFiles(SCRIPTS_DIR, ROUTES_DIR);

  // 1. Browser-Build (ctx) - Bleibt unverändert, da es keinen Node-Code bündelt
  const ctx = await context({
    entryPoints,
    bundle: true,
    platform: "browser",
    format: "esm",
    outbase: ROOT_DIR,
    outdir: SOURCE_DIR,
    sourcemap: config.build?.sourcemap || false,
    minify: config.build?.minify || true,
    loader: config.build?.loaderOptions || {},
  });

  const moduleFiles = await collectModuleFiles(MODULES_DIR);

  // 2. Node.js-Build (module) - Wichtige Änderung hier:
  const module = await context({
    entryPoints: moduleFiles,
    bundle: true,
    platform: "node",
    format: "esm",
    outbase: MODULES_DIR,
    outdir: path.join(SOURCE_DIR, "modules"),
    sourcemap: config.build?.sourcemap || false,
    minify: config.build?.minify || true,

    // NEU: Markiert alle Abhängigkeiten als extern
    packages: "external",
  });

  //! ES SOLL KLAPPEN!!! AHHHH

  await ctx.watch();
  await module.watch();
}
