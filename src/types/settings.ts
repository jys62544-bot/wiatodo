export type WidgetMode = "floating_icon" | "todo_panel" | "hidden_to_tray";

export interface AppSettings {
  widgetMode: WidgetMode;
  isLocked: boolean;
  windowPosition: { x: number; y: number } | null;
  panelSize: { width: number; height: number };
  launchAtStartup: boolean;
}

export interface StoreState {
  todos: import("./todo").TodoItem[];
  settings: AppSettings;
}
