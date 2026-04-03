import type { Adapter } from "./types.js";
import { claudeCodeAdapter } from "./claude-code.js";
import { cursorAdapter } from "./cursor.js";
import { codexAdapter } from "./codex.js";
import { opencodeAdapter } from "./opencode.js";

export const adapters: Record<string, Adapter> = {
  "claude-code": claudeCodeAdapter,
  cursor: cursorAdapter,
  codex: codexAdapter,
  opencode: opencodeAdapter,
};

export function getAdapter(id: string): Adapter | undefined {
  return adapters[id];
}

export function getAdapters(ids: string[]): Adapter[] {
  return ids.map(id => adapters[id]).filter((a): a is Adapter => a !== undefined);
}

export const ALL_TARGET_IDS = Object.keys(adapters);

export type { Adapter, CommandFile, McpServer, SyncResult, McpSyncResult } from "./types.js";
