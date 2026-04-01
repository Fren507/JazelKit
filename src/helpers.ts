// src/helpers.ts

import path from "path";
import { constants } from "fs";
import { access, readdir } from "fs/promises";

/**
 * Checks if a given path exists (file or directory).
 * Prüft, ob ein gegebener Pfad existiert (Datei oder Verzeichnis).
 * @param filePath - Path to the file or directory — Pfad zur Datei oder zum Verzeichnis
 * @returns True if the path exists, false otherwise — Wahr, wenn der Pfad existiert, sonst falsch
 */
export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function getChildDirs(
  dir: string,
  filter: RegExp = /.*/
): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory() && filter.test(entry.name))
    .map((entry) => path.join(dir, entry.name));
}

export async function collectFiles(
  dir: string,
  filterFn: (name: string) => boolean
): Promise<string[]> {
  const exists = await pathExists(dir);
  if (!exists) return []; // Verzeichnis existiert nicht → leer zurückgeben

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

export function UUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID(); // Browser oder Node >=18
  }
  // Fallback für ältere Umgebungen
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
