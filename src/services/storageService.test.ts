import { describe, expect, it } from "vitest";
import { normalizeStoredState } from "./storageService";

describe("normalizeStoredState", () => {
  it("starts in floating icon mode even when the previous session saved another mode", () => {
    const state = normalizeStoredState({
      todos: [],
      settings: {
        widgetMode: "todo_panel",
        isLocked: true,
        windowPosition: { x: 120, y: 160 },
        panelSize: { width: 420, height: 600 },
        launchAtStartup: false,
      },
    });

    expect(state.settings).toMatchObject({
      widgetMode: "floating_icon",
      isLocked: true,
      windowPosition: { x: 120, y: 160 },
    });
  });
});
