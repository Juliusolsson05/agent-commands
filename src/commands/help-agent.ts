import chalk from "chalk";

const AGENT_PROMPT = `# agent-commands — CLI Tool Reference

You have access to \`agent-commands\` (alias: \`ac\`), a CLI tool that manages AI agent commands, prompts, and MCP server configs across multiple platforms (Claude Code, Cursor, Codex, OpenCode).

## How It Works

Commands are markdown files stored in source directories. When synced, they get symlinked to each platform's expected directory. Commands are merged from three scopes with priority: project > profile > global.

## Available Commands

### Setup
- \`ac init\` — Initialize in current repo (interactive)
- \`ac init --all --gitignore\` — Init with all platforms, gitignore generated dirs
- \`ac init --targets claude-code,cursor\` — Init with specific platforms
- \`ac init --global\` — Initialize global config at ~/.agent-commands/

### Managing Commands
- \`ac add <name>\` — Create a new command template
- \`ac add <name> --from <path>\` — Import command from an existing .md file
- \`ac add <name> --content "prompt text"\` — Create command with inline content
- \`ac add <name> --global\` — Add to global commands
- \`ac remove <name>\` — Remove command from source and all synced targets
- \`ac list\` — Show all commands with scope and sync status per platform

### Syncing
- \`ac sync\` — Merge and distribute project + profile + global commands
- \`ac sync --global\` — Sync global commands only

### Profiles
- \`ac profile create <name>\` — Create a named command set
- \`ac profile switch <name>\` — Activate a profile
- \`ac profile list\` — Show all profiles and which is active
- \`ac profile delete <name>\` — Delete a profile

### Import from GitHub
- \`ac sync-repo add <url>\` — Clone a repo and import its commands/ directory
- \`ac sync-repo add <url> --profile <name>\` — Import into a specific profile
- \`ac sync-repo update\` — Pull latest from all tracked repos
- \`ac sync-repo list\` — Show tracked repos
- \`ac sync-repo remove <url>\` — Stop tracking a repo

### MCP Server Management
- \`ac mcp add\` — Interactive: add an MCP server config to selected platforms
- \`ac mcp remove <name>\` — Remove MCP server from all platforms
- \`ac mcp list\` — Show MCP servers and which platforms have them

### Git Hooks
- \`ac hook install\` — Install post-checkout/post-merge hooks for auto-sync
- \`ac hook remove\` — Remove the git hooks

### Help
- \`ac help\` — Detailed help with workflow and examples
- \`ac help-agent\` — Output this reference (for AI agents)

## Command File Format

Commands are markdown files with optional YAML frontmatter:

\`\`\`markdown
---
description: What this command does
---

Your prompt content here.

$ARGUMENTS
\`\`\`

\`$ARGUMENTS\` gets replaced with whatever the user types after the slash command.

## Command Priority (when syncing)

1. Project commands (\`commands/\`) — highest priority
2. Active profile commands (\`~/.agent-commands/profiles/<name>/commands/\`)
3. Global commands (\`~/.agent-commands/commands/\`) — lowest priority

Same filename = higher scope wins.

## Config Files

- Project config: \`.agent-commands.yml\` (targets, overrides)
- Global config: \`~/.agent-commands/config.yml\` (targets, active profile, tracked repos)
- Source commands: \`commands/\` (project) or \`~/.agent-commands/commands/\` (global)
- Profiles: \`~/.agent-commands/profiles/<name>/commands/\`
- Repo cache: \`~/.agent-commands/repos/\`

## Supported Platforms

| Platform | Commands | MCP |
|----------|----------|-----|
| Claude Code | ✓ (.claude/commands/) | ✓ (.claude/mcp.json) |
| Cursor | ✓ (.cursor/prompts/) | ✓ (.cursor/mcp.json) |
| Codex | ✗ | ✓ (.codex/mcp.json) |
| OpenCode | ✗ | ✓ (opencode.json) |
`;

export function helpAgentCommand(): void {
  console.log(AGENT_PROMPT);
  console.log(chalk.dim("Copy the above and paste it to your AI agent, or pipe it:"));
  console.log(chalk.dim("  ac help-agent | pbcopy"));
}
