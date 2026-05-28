export interface SystemMetrics {
  cpuPercent: number | null;
  memoryPercent: number;
  memoryUsedGb: number;
  memoryTotalGb: number;
}

interface RawSystemMetrics {
  cpuPercent?: unknown;
  memoryPercent?: unknown;
  memoryUsedGb?: unknown;
  memoryTotalGb?: unknown;
}

export async function getSystemMetrics(): Promise<SystemMetrics | null> {
  if (!isTauriRuntime()) {
    return null;
  }

  const { invoke } = await import("@tauri-apps/api/core");
  return normalizeSystemMetrics(await invoke<RawSystemMetrics>("get_system_metrics"));
}

export function normalizeSystemMetrics(raw: RawSystemMetrics): SystemMetrics {
  return {
    cpuPercent: raw.cpuPercent === null || raw.cpuPercent === undefined ? null : clampPercent(toNumber(raw.cpuPercent)),
    memoryPercent: clampPercent(toNumber(raw.memoryPercent)),
    memoryUsedGb: Math.max(0, toNumber(raw.memoryUsedGb)),
    memoryTotalGb: Math.max(0, toNumber(raw.memoryTotalGb)),
  };
}

export function formatMetricPercent(value: number | null): string {
  return value === null ? "--%" : `${value.toFixed(1)}%`;
}

export function formatMemoryDetail(metrics: Pick<SystemMetrics, "memoryUsedGb" | "memoryTotalGb">): string {
  return `${metrics.memoryUsedGb.toFixed(1)}/${metrics.memoryTotalGb.toFixed(1)}GB`;
}

function clampPercent(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
