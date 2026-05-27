import { describe, expect, it } from "vitest";
import { clampPositionToVisibleArea, getDefaultPanelPosition } from "./windowService";

const primaryMonitor = {
  position: { x: 0, y: 0 },
  size: { width: 2560, height: 1600 },
  scaleFactor: 1,
};

const scaledMonitor = {
  position: { x: 0, y: 0 },
  size: { width: 2560, height: 1600 },
  scaleFactor: 1.5,
};

describe("clampPositionToVisibleArea", () => {
  it("keeps an already visible saved window position", () => {
    expect(
      clampPositionToVisibleArea(
        { x: 120, y: 160 },
        { width: 64, height: 64 },
        [primaryMonitor],
      ),
    ).toEqual({ x: 120, y: 160 });
  });

  it("moves an off-screen saved window position back into the primary visible area", () => {
    expect(
      clampPositionToVisibleArea(
        { x: 5981, y: 3788 },
        { width: 420, height: 600 },
        [primaryMonitor],
      ),
    ).toEqual({ x: 2140, y: 1000 });
  });
});

describe("getDefaultPanelPosition", () => {
  it("places the panel in a fixed visible area instead of using the saved icon position", () => {
    expect(getDefaultPanelPosition({ width: 420, height: 600 }, [primaryMonitor])).toEqual({ x: 2116, y: 500 });
  });

  it("uses the monitor scale factor so the panel stays fully visible on high DPI displays", () => {
    expect(getDefaultPanelPosition({ width: 420, height: 600 }, [scaledMonitor])).toEqual({ x: 1906, y: 350 });
  });
});
