import { mkdirSync, existsSync, symlinkSync, copyFileSync, readFileSync, writeFileSync, unlinkSync, readdirSync, appendFileSync } from "fs";
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

const GIT_EXCLUDE_PATTERNS = [
  ".agent-mgr.yml",
  "commands/",
  ".claude/commands/",
  ".cursor/prompts/",
  ".codex/",
  "opencode.json",
];

/**
 * Add all agent-mgr patterns to .git/info/exclude.
 * Called by `init --gitignore`.
 */
function excludeHasPattern(content: string, pattern: string): boolean {
  return content.split("\n").some(line => line.trim() === pattern);
}

export function addGitExclude(projectRoot: string): void {
  const excludePath = join(projectRoot, ".git", "info", "exclude");
  if (!existsSync(join(projectRoot, ".git"))) return;

  const existing = existsSync(excludePath) ? readFileSync(excludePath, "utf-8") : "";
  const missing = GIT_EXCLUDE_PATTERNS.filter(p => !excludeHasPattern(existing, p));

  if (missing.length === 0) return;

  const addition = "\n# agent-mgr\n" + missing.join("\n") + "\n";
  ensureDir(dirname(excludePath));
  appendFileSync(excludePath, addition);
}

/**
 * If the user already opted into gitignore (marker exists), ensure new patterns are added.
 * If no marker, do nothing — user chose not to gitignore.
 */
export function updateGitExclude(projectRoot: string): void {
  const excludePath = join(projectRoot, ".git", "info", "exclude");
  if (!existsSync(excludePath)) return;

  const existing = readFileSync(excludePath, "utf-8");
  if (!existing.includes("# agent-mgr")) return; // user didn't opt in

  const missing = GIT_EXCLUDE_PATTERNS.filter(p => !excludeHasPattern(existing, p));
  if (missing.length === 0) return;

  appendFileSync(excludePath, missing.join("\n") + "\n");
}

export function parseFrontmatter(content: string): { description: string; body: string } {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("---")) {
    return { description: "", body: content.trim() };
  }

  const endIndex = trimmed.indexOf("---", 3);
  if (endIndex === -1) {
    return { description: "", body: content.trim() };
  }

  const frontmatter = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 3).trim();

  let description = "";
  for (const line of frontmatter.split("\n")) {
    const match = line.match(/^description:\s*(.+)$/);
    if (match) {
      description = match[1].trim();
      break;
    }
  }

  return { description, body };
}
