// build.js

import { readdir, mkdir, copyFile } from "fs/promises";
import path from "path";
import esbuild from "esbuild";

const __filename = new URL("", import.meta.url).pathname;
const __dirname = path.dirname(__filename);

async function collectFiles(dir, filterFn) {
  const entries = await readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await collectFiles(fullPath, filterFn));
    } else if (filterFn(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function copyTypesFromDistToBuild(distDir, buildDir) {
  const typeDirFiles = await collectFiles(
    distDir,
    (name) => name.endsWith(".d.ts") || name.endsWith(".d.ts.map")
  );
  for (const file of typeDirFiles) {
    const relPath = path.relative(distDir, file);
    const outFile = path.join(buildDir, relPath);
    await mkdir(path.dirname(outFile), { recursive: true });
    await copyFile(file, outFile);
  }
}

async function main() {
  const SRC_DIR = path.join(__dirname, "./src");
  const BUILD_DIR = path.join(__dirname, "./build");
  const DIST_DIR = path.join(__dirname, "./dist");

  const tsFiles = await collectFiles(SRC_DIR, (name) => name.endsWith(".ts"));

  // // Compile Files with tsc for type declarations
  // console.log("Compiling TypeScript files for type declarations...");
  // const tscProcess = await new Promise((resolve, reject) => {
  //   const proc = process.spawn("tsc", ["--emitDeclarationOnly"], {
  //     stdio: "inherit",
  //     shell: true,
  //   });
  //   proc.on("close", (code) => {
  //     if (code === 0) resolve(code);
  //     else reject(new Error(`tsc process exited with code ${code}`));
  //   });
  // });
  // console.log("TypeScript compilation completed.");

  // Minify each .ts file individually without bundling
  console.log("Minifying TypeScript files without bundling...");

  await mkdir(BUILD_DIR, { recursive: true });

  for (const file of tsFiles) {
    const relPath = path.relative(SRC_DIR, file);
    const relPathJs = relPath.replace(/\.ts$/, ".js");
    const outFile = path.join(BUILD_DIR, relPathJs);
    await mkdir(path.dirname(outFile), { recursive: true });

    await esbuild.build({
      entryPoints: [file],
      outfile: outFile,
      minify: true,
      bundle: false, // Kein Bundling
      sourcemap: true,
      platform: "node", // oder "browser", je nach Ziel
      format: "esm", // oder "cjs"
    });
    console.log(`Minified: ${file} -> ${outFile}`);
  }
  await copyTypesFromDistToBuild(DIST_DIR, BUILD_DIR);
  console.log("Copied .d.ts files to build directory.");

  console.log("✅ Alle TS-Dateien minified ohne bundling!");
}

main();
