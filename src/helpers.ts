// src/helpers.ts

import path from "path";
import { constants } from "fs";
import { access, readdir } from "fs/promises";

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function collectFiles(
  dir: string,
  filterFn: (name: string) => boolean
): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  let files: Array<string> = [];

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
