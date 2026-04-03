import { homedir } from "os";
import { join } from "path";
import type { Adapter, McpServer } from "./types.js";
import { readJson, writeJson } from "../lib/fs-utils.js";

export const opencodeAdapter: Adapter = {
  name: "OpenCode",
  id: "opencode",
  supportsCommands: true,

  getCommandsDir(scope, projectRoot) {
    if (scope === "global") return join(homedir(), ".config", "opencode", "commands");
    return join(projectRoot, ".opencode", "commands");
  },

  getMcpConfigPath(scope, projectRoot) {
    if (scope === "global") return join(homedir(), ".config", "opencode", "opencode.json");
    return join(projectRoot, "opencode.json");
  },

  async readMcpConfig(scope, projectRoot) {
    const path = this.getMcpConfigPath(scope, projectRoot);
    const data = readJson(path) as { mcp?: Record<string, Record<string, unknown>> };
    const mcp = data.mcp ?? {};
    const result: Record<string, McpServer> = {};
    for (const [name, cfg] of Object.entries(mcp)) {
      const cmd = cfg.command;
      if (Array.isArray(cmd) && cmd.length > 0) {
        result[name] = {
          name,
          command: cmd[0] as string,
          args: cmd.slice(1) as string[],
          env: (cfg.environment as Record<string, string>) ?? {},
        };
      }
    }
    return result;
  },

  async writeMcpConfig(servers, scope, projectRoot) {
    const path = this.getMcpConfigPath(scope, projectRoot);
    const existing = readJson(path);
    const mcp = (existing.mcp ?? {}) as Record<string, unknown>;
    for (const [name, server] of Object.entries(servers)) {
      mcp[name] = {
        type: "local",
        command: [server.command, ...(server.args ?? [])],
        environment: server.env ?? {},
        enabled: true,
      };
    }
    existing.mcp = mcp;
    writeJson(path, existing);
  },
};
