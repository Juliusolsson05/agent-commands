import { join } from "path";
import { existsSync, writeFileSync } from "fs";
import chalk from "chalk";
import { findProjectRoot, getCommandsDir, GLOBAL_COMMANDS_DIR } from "../lib/paths.js";
import { ensureDir } from "../lib/fs-utils.js";

export function addCommand(name: string, options: { global?: boolean }): void {
  const scope = options.global ? "global" : "project";

  let commandsDir: string;
  if (scope === "global") {
    commandsDir = GLOBAL_COMMANDS_DIR;
  } else {
    const root = findProjectRoot();
    if (!root) {
      console.log(chalk.red("Not in an agent-commands project. Run `agent-commands init` first."));
      return;
    }
    commandsDir = getCommandsDir("project", root);
  }

  const cleanName = name.replace(/\.md$/, "");
  const filePath = join(commandsDir, `${cleanName}.md`);

  if (existsSync(filePath)) {
    console.log(chalk.yellow(`Command "${cleanName}" already exists at ${filePath}`));
    return;
  }

  ensureDir(commandsDir);

  const template = `---
description: ${cleanName} command
---

$ARGUMENTS
`;

  writeFileSync(filePath, template);
  console.log(chalk.green(`✓ Created ${filePath}`));
  console.log(chalk.dim("Edit the file to add your prompt, then run: agent-commands sync"));
}
