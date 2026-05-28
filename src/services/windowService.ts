import type { WidgetMode } from "../types/settings";

interface VisibleArea {
  position: { x: number; y: number };
  size: { width: number; height: number };
  scaleFactor: number;
}

const PANEL_MARGIN = 24;
const FLOATING_WIDGET_SIZE = { width: 148, height: 48 };

export async function applyWindowMode(
  mode: WidgetMode,
  panelSize: { width: number; height: number },
  windowPosition: { x: number; y: number } | null,
): Promise<void> {
  if (!isTauriRuntime()) {
    return;
  }

  const { availableMonitors, getCurrentWindow, LogicalSize, PhysicalPosition } = await import("@tauri-apps/api/window");
  const appWindow = getCurrentWindow();

  if (mode === "hidden_to_tray") {
    await appWindow.hide();
    return;
  }

  const targetSize = mode === "floating_icon" ? FLOATING_WIDGET_SIZE : panelSize;
  const size = new LogicalSize(targetSize.width, targetSize.height);
  await appWindow.setSize(size);

  const monitors = await availableMonitors();
  const visibleAreas = monitors.map((monitor) => ({
    position: monitor.workArea.position,
    size: monitor.workArea.size,
    scaleFactor: monitor.scaleFactor,
  }));
  const visiblePosition =
    mode === "todo_panel"
      ? getDefaultPanelPosition(panelSize, visibleAreas)
      : windowPosition
        ? clampPositionToVisibleArea(windowPosition, targetSize, visibleAreas)
        : null;

  if (visiblePosition) {
    await appWindow.setPosition(new PhysicalPosition(visiblePosition.x, visiblePosition.y));
  }

  await appWindow.setAlwaysOnTop(true);
  await appWindow.show();
  await appWindow.setFocus();
}

export function getDefaultPanelPosition(
  panelSize: { width: number; height: number },
  visibleAreas: VisibleArea[],
): { x: number; y: number } {
  if (visibleAreas.length === 0) {
    return { x: PANEL_MARGIN, y: PANEL_MARGIN };
  }

  const area = visibleAreas[0];
  const physicalPanelSize = getPhysicalWindowSize(panelSize, area.scaleFactor);
  const x = area.position.x + area.size.width - physicalPanelSize.width - PANEL_MARGIN;
  const y = area.position.y + Math.round((area.size.height - physicalPanelSize.height) / 2);

  return clampPositionToArea({ x, y }, physicalPanelSize, area);
}

export function clampPositionToVisibleArea(
  position: { x: number; y: number },
  windowSize: { width: number; height: number },
  visibleAreas: VisibleArea[],
): { x: number; y: number } {
  if (visibleAreas.length === 0) {
    return position;
  }

  for (const area of visibleAreas) {
    const clamped = clampPositionToArea(position, getPhysicalWindowSize(windowSize, area.scaleFactor), area);

    if (clamped.x === position.x && clamped.y === position.y) {
      return position;
    }
  }

  return clampPositionToArea(
    position,
    getPhysicalWindowSize(windowSize, visibleAreas[0].scaleFactor),
    visibleAreas[0],
  );
}

function getPhysicalWindowSize(
  logicalSize: { width: number; height: number },
  scaleFactor: number,
): { width: number; height: number } {
  return {
    width: Math.round(logicalSize.width * scaleFactor),
    height: Math.round(logicalSize.height * scaleFactor),
  };
}

function clampPositionToArea(
  position: { x: number; y: number },
  windowSize: { width: number; height: number },
  area: VisibleArea,
): { x: number; y: number } {
  const minX = area.position.x;
  const minY = area.position.y;
  const maxX = Math.max(minX, area.position.x + area.size.width - windowSize.width);
  const maxY = Math.max(minY, area.position.y + area.size.height - windowSize.height);

  return {
    x: Math.min(Math.max(position.x, minX), maxX),
    y: Math.min(Math.max(position.y, minY), maxY),
  };
}

export async function startWindowDrag(): Promise<void> {
  if (!isTauriRuntime()) {
    return;
  }

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  await getCurrentWindow().startDragging();
}

export async function getWindowPosition(): Promise<{ x: number; y: number } | null> {
  if (!isTauriRuntime()) {
    return null;
  }

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  const position = await getCurrentWindow().outerPosition();
  return { x: position.x, y: position.y };
}

export async function setWindowAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
  if (!isTauriRuntime()) {
    return;
  }

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  await getCurrentWindow().setAlwaysOnTop(alwaysOnTop);
}

export async function bindTrayEvents(
  setMode: (mode: "floating_icon" | "todo_panel") => void,
  toggleLock: () => void,
  requestExit: () => void,
): Promise<() => void> {
  if (!isTauriRuntime()) {
    return () => undefined;
  }

  const { listen } = await import("@tauri-apps/api/event");
  const unlistenMode = await listen<"floating_icon" | "todo_panel">("tray-show-mode", (event) => {
    setMode(event.payload);
  });
  const unlistenLock = await listen("tray-toggle-lock", () => {
    toggleLock();
  });
  const unlistenExit = await listen("tray-request-exit", () => {
    requestExit();
  });

  return () => {
    unlistenMode();
    unlistenLock();
    unlistenExit();
  };
}

export async function bindWindowMoved(savePosition: (position: { x: number; y: number }) => void): Promise<() => void> {
  if (!isTauriRuntime()) {
    return () => undefined;
  }

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  let timeout = 0;
  const unlisten = await getCurrentWindow().onMoved(({ payload }) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      savePosition({ x: payload.x, y: payload.y });
    }, 120);
  });

  return () => {
    window.clearTimeout(timeout);
    unlisten();
  };
}

export async function exitApp(): Promise<void> {
  if (!isTauriRuntime()) {
    return;
  }

  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("exit_app");
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
