import { program } from "commander";

program
  .name("agent-commands")
  .description(
    "Write commands once, sync everywhere. Manage AI agent commands, prompts, and MCP configs."
  )
  .version("0.0.1");

// Commands will be registered here
// import "./commands/init";
// import "./commands/sync";
// import "./commands/add";

program.parse();
