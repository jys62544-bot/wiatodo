import { describe, expect, it } from "vitest";
import { canSubmitImport } from "./ImportModal";

describe("ImportModal import action", () => {
  it("allows direct import after text input without requiring preview first", () => {
    expect(canSubmitImport("1、整理本周计划")).toBe(true);
  });

  it("keeps import unavailable while the input is empty", () => {
    expect(canSubmitImport("   \n  ")).toBe(false);
  });
});
