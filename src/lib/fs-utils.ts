import { mkdirSync, existsSync, symlinkSync, copyFileSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from "fs";
import { dirname, join, relative, extname } from "path";

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function syncFile(source: string, dest: string, method: "symlink" | "copy" = "symlink"): void {
  ensureDir(dirname(dest));
  if (existsSync(dest)) unlinkSync(dest);
  if (method === "symlink") {
    const rel = relative(dirname(dest), source);
    symlinkSync(rel, dest);
  } else {
    copyFileSync(source, dest);
  }
}

export function removeFile(filePath: string): boolean {
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    return true;
  }
  return false;
}

export function listMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return (readdirSync(dir, { recursive: true }) as Array<string | Buffer>)
    .map((f: string | Buffer) => f.toString())
    .filter((f: string) => extname(f) === ".md");
}

export function readJson(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, "utf-8"));
}

export function writeJson(path: string, data: Record<string, unknown>): void {
  ensureDir(dirname(path));
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

export function parseSimpleYaml(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("- ") && currentKey) {
      if (!currentList) currentList = [];
      currentList.push(trimmed.slice(2).trim());
      continue;
    }

    if (currentKey && currentList) {
      result[currentKey] = currentList;
      currentList = null;
    }

    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (match) {
      currentKey = match[1];
      const value = match[2].trim();
      if (value) {
        result[currentKey] = value;
        currentKey = null;
      }
    }
  }

  if (currentKey && currentList) {
    result[currentKey] = currentList;
  }

  return result;
}

export function serializeSimpleYaml(data: Record<string, unknown>): string {
  let out = "";
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      out += `${key}:\n`;
      for (const item of value) {
        out += `  - ${item}\n`;
      }
    } else {
      out += `${key}: ${value}\n`;
    }
  }
  return out;
}

export function readYaml(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  const text = readFileSync(path, "utf-8");
  return parseSimpleYaml(text);
}

export function writeYaml(path: string, data: Record<string, unknown>): void {
  ensureDir(dirname(path));
  writeFileSync(path, serializeSimpleYaml(data));
}
