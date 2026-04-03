import { join } from "path";
import chalk from "chalk";
import { findProjectRoot, getCommandsDir, GLOBAL_COMMANDS_DIR } from "../lib/paths.js";
import { loadConfig } from "../lib/config.js";
import { getAdapters } from "../adapters/index.js";
import { listMarkdownFiles, syncFile } from "../lib/fs-utils.js";
import type { SyncResult } from "../adapters/types.js";

export function syncCommand(options: { global?: boolean }): void {
  const scope = options.global ? "global" : "project";

  let projectRoot: string;
  let commandsDir: string;

  if (scope === "global") {
    projectRoot = "";
    commandsDir = GLOBAL_COMMANDS_DIR;
  } else {
    const root = findProjectRoot();
    if (!root) {
      console.log(chalk.red("Not in an agent-commands project. Run `agent-commands init` first."));
      return;
    }
    projectRoot = root;
    commandsDir = getCommandsDir("project", root);
  }

  const config = loadConfig(scope, projectRoot || undefined);
  if (config.targets.length === 0) {
    console.log(chalk.red("No targets configured. Run `agent-commands init` first."));
    return;
  }

  const files = listMarkdownFiles(commandsDir);
  if (files.length === 0) {
    console.log(chalk.yellow("No commands found. Add some with: agent-commands add <name>"));
    return;
  }

  const targetAdapters = getAdapters(config.targets);
  const results: SyncResult[] = [];

  for (const file of files) {
    const sourcePath = join(commandsDir, file);

    for (const adapter of targetAdapters) {
      if (!adapter.supportsCommands) {
        results.push({ target: adapter.name, command: file, status: "skipped", reason: "no command support" });
        continue;
      }

      const targetDir = adapter.getCommandsDir(scope, projectRoot);
      if (!targetDir) {
        results.push({ target: adapter.name, command: file, status: "skipped", reason: "no directory for scope" });
        continue;
      }

      try {
        const destPath = join(targetDir, file);
        syncFile(sourcePath, destPath);
        results.push({ target: adapter.name, command: file, status: "synced" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ target: adapter.name, command: file, status: "failed", reason: msg });
      }
    }
  }

  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const r of results) {
    if (r.status === "synced") {
      console.log(chalk.green(`✓ ${r.command} → ${r.target}`));
      synced++;
    } else if (r.status === "skipped") {
      skipped++;
    } else {
      console.log(chalk.red(`✗ ${r.command} → ${r.target}: ${r.reason}`));
      failed++;
    }
  }

  console.log("");
  console.log(`Synced ${chalk.green(String(synced))} command(s) to ${targetAdapters.filter(a => a.supportsCommands).length} target(s)`);
  if (skipped > 0) console.log(chalk.dim(`Skipped ${skipped} (no command support)`));
  if (failed > 0) console.log(chalk.red(`Failed: ${failed}`));
}
