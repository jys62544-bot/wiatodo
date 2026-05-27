import type { StoreState } from "../types/settings";
import { createDefaultSettings } from "./todoDomain";

const STATE_KEY = "todo-widget-state";
const STORE_FILE = "todo-widget-store.json";

export async function loadState(): Promise<StoreState> {
  try {
    const raw = await loadRawState();
    return normalizeStoredState(raw);
  } catch (error) {
    console.warn("Failed to load state, using defaults", error);
    return createDefaultState();
  }
}

export async function saveState(state: StoreState): Promise<void> {
  const normalized = normalizeState(state);

  if (isTauriRuntime()) {
    try {
      const { load } = await import("@tauri-apps/plugin-store");
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      await store.set(STATE_KEY, normalized);
      await store.save();
      return;
    } catch (error) {
      console.warn("Tauri store save failed, falling back to localStorage", error);
    }
  }

  window.localStorage.setItem(STATE_KEY, JSON.stringify(normalized));
}

export function createDefaultState(): StoreState {
  return {
    todos: [],
    settings: createDefaultSettings(),
  };
}

export function normalizeStoredState(raw: unknown): StoreState {
  const state = normalizeState(raw);

  return {
    ...state,
    settings: {
      ...state.settings,
      widgetMode: "floating_icon",
    },
  };
}

async function loadRawState(): Promise<unknown> {
  if (isTauriRuntime()) {
    try {
      const { load } = await import("@tauri-apps/plugin-store");
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      return await store.get<StoreState>(STATE_KEY);
    } catch (error) {
      console.warn("Tauri store load failed, falling back to localStorage", error);
    }
  }

  const raw = window.localStorage.getItem(STATE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function normalizeState(raw: unknown): StoreState {
  if (!raw || typeof raw !== "object") {
    return createDefaultState();
  }

  const candidate = raw as Partial<StoreState>;
  const defaults = createDefaultState();
  const todos = Array.isArray(candidate.todos)
    ? candidate.todos
        .filter((todo) => todo && typeof todo === "object")
        .map((todo) => todo as StoreState["todos"][number])
        .filter((todo) => typeof todo.id === "string" && typeof todo.title === "string")
        .map((todo) => ({
          id: todo.id,
          title: todo.title.trim(),
          status: todo.status === "completed" ? ("completed" as const) : ("pending" as const),
          isImportant: Boolean(todo.isImportant),
          createdAt: numberOrNow(todo.createdAt),
          updatedAt: numberOrNow(todo.updatedAt),
          completedAt: typeof todo.completedAt === "number" ? todo.completedAt : null,
        }))
        .filter((todo) => todo.title)
    : [];

  const settings =
    candidate.settings && typeof candidate.settings === "object"
      ? {
          ...defaults.settings,
          ...candidate.settings,
          widgetMode: normalizeWidgetMode(candidate.settings.widgetMode),
          windowPosition: normalizePosition(candidate.settings.windowPosition),
          panelSize: normalizePanelSize(candidate.settings.panelSize),
          isLocked: Boolean(candidate.settings.isLocked),
          launchAtStartup: Boolean(candidate.settings.launchAtStartup),
        }
      : defaults.settings;

  return { todos, settings };
}

function normalizeWidgetMode(mode: unknown): StoreState["settings"]["widgetMode"] {
  if (mode === "todo_panel" || mode === "floating_icon") {
    return mode;
  }

  return "floating_icon";
}

function normalizePosition(position: unknown): StoreState["settings"]["windowPosition"] {
  if (
    position &&
    typeof position === "object" &&
    typeof (position as { x?: unknown }).x === "number" &&
    typeof (position as { y?: unknown }).y === "number"
  ) {
    return { x: (position as { x: number }).x, y: (position as { y: number }).y };
  }

  return null;
}

function normalizePanelSize(size: unknown): StoreState["settings"]["panelSize"] {
  if (
    size &&
    typeof size === "object" &&
    typeof (size as { width?: unknown }).width === "number" &&
    typeof (size as { height?: unknown }).height === "number"
  ) {
    return {
      width: Math.max(340, (size as { width: number }).width),
      height: Math.max(420, (size as { height: number }).height),
    };
  }

  return { width: 420, height: 600 };
}

function numberOrNow(value: unknown): number {
  return typeof value === "number" ? value : Date.now();
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
