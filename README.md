# agent-mgr

Manage AI agent commands, prompts, and MCP configs from one place. Write a command once, sync it to Claude Code, Cursor, Codex, and OpenCode.

## Install

```bash
npm install -g agent-mgr
```

Or use directly:

```bash
npx agent-mgr init
```

## Quick start

```bash
amgr init                          # pick your platforms
amgr add review                    # create a command
# edit commands/review.md
amgr sync                          # symlink to all platforms
```

Your command is now available as `/review` in Claude Code, Cursor, etc.

## What it does

You maintain commands in a `commands/` directory. `amgr sync` creates symlinks into each platform's expected location (`.claude/commands/`, `.cursor/prompts/`, etc.). Edit the source, every platform stays in sync.

## Commands

```
amgr init                          Setup (interactive or with flags)
amgr init --all --gitignore        All platforms, gitignore generated dirs

amgr add <name>                    Create command template
amgr add <name> --from <file>      Import from existing .md
amgr add <name> --content "..."    Inline content
amgr remove <name>                 Delete command + synced copies
amgr sync                          Distribute to all platforms
amgr list                          Show commands and sync status

amgr profile create <name>         Named command sets
amgr profile switch <name>         Activate a profile
amgr profile list                  Show profiles
amgr profile delete <name>         Delete a profile

amgr sync-repo add <url>           Import commands from a GitHub repo
amgr sync-repo update              Pull latest from tracked repos
amgr sync-repo list                Show tracked repos
amgr sync-repo remove <url>        Stop tracking

amgr mcp add                       Add MCP server config (interactive)
amgr mcp remove <name>             Remove from all platforms
amgr mcp list                      Show MCP servers per platform

amgr hook install                  Auto-sync on git checkout/merge
amgr hook remove                   Remove hooks

amgr help                          Detailed help
amgr help-agent                    Output reference for AI agents
```

## Command priority

When syncing, commands merge from three sources. Higher priority wins when filenames collide:

1. **Project** (`commands/`)
2. **Profile** (`~/.agent-mgr/profiles/<name>/commands/`)
3. **Global** (`~/.agent-mgr/commands/`)

## Supported platforms

| Platform | Commands | MCP |
|----------|----------|-----|
| Claude Code | `.claude/commands/` | `.claude/mcp.json` |
| Cursor | `.cursor/prompts/` | `.cursor/mcp.json` |
| Codex | - | `.codex/mcp.json` |
| OpenCode | - | `opencode.json` |

## Command format

```markdown
---
description: What this command does
---

Your prompt here.

$ARGUMENTS
```

`$ARGUMENTS` is replaced with whatever the user types after the slash command.

## Config files

```
.agent-mgr.yml                    Project config (targets)
~/.agent-mgr/config.yml           Global config
~/.agent-mgr/commands/            Global commands
~/.agent-mgr/profiles/            Named profiles
~/.agent-mgr/repos/               Cached repo clones
```

## Works with AI agents

Run `amgr help-agent` to get a reference prompt you can give to your AI agent. It will understand the tool and help you configure it.

## License

MIT
