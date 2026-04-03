import { homedir } from "os";
import { join } from "path";
import type { Adapter, McpServer } from "./types.js";
import { readToml, writeToml } from "../lib/fs-utils.js";

export const codexAdapter: Adapter = {
  name: "Codex",
  id: "codex",
  supportsCommands: false,

  getCommandsDir() {
    return null;
  },

  getMcpConfigPath(scope, projectRoot) {
    if (scope === "global") return join(homedir(), ".codex", "config.toml");
    return join(projectRoot, ".codex", "config.toml");
  },

  async readMcpConfig(scope, projectRoot) {
    const path = this.getMcpConfigPath(scope, projectRoot);
    const data = readToml(path);
    const servers = (data.mcp_servers ?? {}) as Record<string, Record<string, unknown>>;
    const result: Record<string, McpServer> = {};
    for (const [name, cfg] of Object.entries(servers)) {
      result[name] = {
        name,
        command: (cfg.command as string) ?? "",
        args: (cfg.args as string[]) ?? [],
        env: (cfg.env as Record<string, string>) ?? {},
      };
    }
    return result;
  },

  async writeMcpConfig(servers, scope, projectRoot) {
    const path = this.getMcpConfigPath(scope, projectRoot);
    const existing = readToml(path);
    const mcpServers = (existing.mcp_servers ?? {}) as Record<string, unknown>;
    for (const [name, server] of Object.entries(servers)) {
      mcpServers[name] = {
        command: server.command,
        args: server.args ?? [],
        env: server.env ?? {},
      };
    }
    existing.mcp_servers = mcpServers;
    writeToml(path, existing);
  },
};
