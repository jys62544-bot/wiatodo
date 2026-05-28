import { describe, expect, it } from "vitest";
import { formatMetricPercent, formatMemoryDetail, normalizeSystemMetrics } from "./systemMetrics";

describe("systemMetrics", () => {
  it("formats unavailable CPU samples without collapsing the metric card", () => {
    expect(formatMetricPercent(null)).toBe("--%");
  });

  it("formats percent and memory details to one decimal place", () => {
    expect(formatMetricPercent(27.34)).toBe("27.3%");
    expect(formatMemoryDetail({ memoryUsedGb: 8.24, memoryTotalGb: 15.86 })).toBe("8.2/15.9GB");
  });

  it("normalizes native payloads and clamps invalid percent values", () => {
    expect(
      normalizeSystemMetrics({
        cpuPercent: 120,
        memoryPercent: -4,
        memoryUsedGb: 4,
        memoryTotalGb: 16,
      }),
    ).toEqual({
      cpuPercent: 100,
      memoryPercent: 0,
      memoryUsedGb: 4,
      memoryTotalGb: 16,
    });
  });
});
