import { program } from "commander";
import { initCommand } from "./commands/init.js";

program
  .name("agent-commands")
  .description(
    "Write commands once, sync everywhere. Manage AI agent commands, prompts, and MCP configs."
  )
  .version("0.0.1");

program
  .command("init")
  .description("Initialize agent-commands in this repo or globally")
  .option("-g, --global", "Initialize global config at ~/.agent-commands/")
  .action(initCommand);

program.parse();
