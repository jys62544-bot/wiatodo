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

  it("migrates legacy single-list todos into the short-term group", () => {
    const state = normalizeStoredState({
      todos: [
        {
          id: "legacy-1",
          title: "  原有事项  ",
          status: "pending",
          isImportant: false,
          createdAt: 100,
          updatedAt: 100,
          completedAt: null,
        },
      ],
      settings: {
        activeTodoScope: "longTerm",
      },
    });

    expect(state.todoGroups.shortTerm.map((todo) => todo.title)).toEqual(["原有事项"]);
    expect(state.todoGroups.longTerm).toEqual([]);
    expect(state.settings.activeTodoScope).toBe("longTerm");
  });

  it("keeps short-term and long-term todo groups independent when loading state", () => {
    const state = normalizeStoredState({
      todoGroups: {
        shortTerm: [{ id: "short-1", title: "短期", status: "pending", createdAt: 100, updatedAt: 100 }],
        longTerm: [{ id: "long-1", title: "长期", status: "completed", createdAt: 200, updatedAt: 300, completedAt: 300 }],
      },
      settings: {
        activeTodoScope: "unknown",
      },
    });

    expect(state.todoGroups.shortTerm.map((todo) => todo.title)).toEqual(["短期"]);
    expect(state.todoGroups.longTerm.map((todo) => todo.title)).toEqual(["长期"]);
    expect(state.settings.activeTodoScope).toBe("longTerm");
  });
});
