import { existsSync } from "fs";
import { readYaml, writeYaml, readJson, writeJson } from "./fs-utils.js";
import { getConfigPath, getMcpSourcePath } from "./paths.js";
import type { McpServer } from "../adapters/types.js";

export interface AgentCommandsConfig {
  targets: string[];
  activeProfile?: string;
  repos?: string[];
}

export function loadConfig(scope: "project" | "global", projectRoot?: string): AgentCommandsConfig {
  const configPath = getConfigPath(scope, projectRoot);
  if (!existsSync(configPath)) return { targets: [] };
  const raw = readYaml(configPath);
  return {
    targets: Array.isArray(raw.targets) ? raw.targets : [],
    activeProfile: typeof raw.activeProfile === "string" ? raw.activeProfile : undefined,
    repos: Array.isArray(raw.repos) ? raw.repos : undefined,
  };
}

export function saveConfig(config: AgentCommandsConfig, scope: "project" | "global", projectRoot?: string): void {
  const configPath = getConfigPath(scope, projectRoot);
  const data: Record<string, unknown> = { targets: config.targets };
  if (config.activeProfile) data.activeProfile = config.activeProfile;
  if (config.repos && config.repos.length > 0) data.repos = config.repos;
  writeYaml(configPath, data);
}

export function loadMcpSource(scope: "project" | "global", projectRoot?: string): Record<string, McpServer> {
  const mcpPath = getMcpSourcePath(scope, projectRoot);
  if (!existsSync(mcpPath)) return {};
  const raw = readJson(mcpPath) as { servers?: Record<string, McpServer> };
  return raw.servers ?? {};
}

export function saveMcpSource(servers: Record<string, McpServer>, scope: "project" | "global", projectRoot?: string): void {
  const mcpPath = getMcpSourcePath(scope, projectRoot);
  writeJson(mcpPath, { servers });
}
