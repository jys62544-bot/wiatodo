import { useEffect } from "react";
import { FloatingIcon } from "./components/FloatingIcon";
import { TodoPanel } from "./components/TodoPanel";
import { applyWindowMode, bindTrayEvents, bindWindowMoved, exitApp } from "./services/windowService";
import { useAppState } from "./store/AppStateContext";

export default function App() {
  const { settings, isHydrated, setWidgetMode, toggleLocked, saveWindowPosition, flushState } = useAppState();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    applyWindowMode(settings.widgetMode, settings.panelSize, settings.windowPosition).catch((error) => {
      console.warn("Failed to apply window mode", error);
    });
  }, [isHydrated, settings.panelSize, settings.widgetMode]);

  useEffect(() => {
    let unlisten: () => void = () => undefined;

    bindTrayEvents(setWidgetMode, toggleLocked, () => {
      flushState()
        .then(exitApp)
        .catch((error) => {
          console.warn("Failed to save before exit", error);
          exitApp().catch((exitError) => console.warn("Failed to exit app", exitError));
        });
    })
      .then((cleanup) => {
        unlisten = cleanup;
      })
      .catch((error) => console.warn("Failed to bind tray events", error));

    return () => unlisten();
  }, [flushState, setWidgetMode, toggleLocked]);

  useEffect(() => {
    if (!isHydrated || settings.widgetMode !== "floating_icon") {
      return;
    }

    let unlisten: () => void = () => undefined;

    bindWindowMoved(saveWindowPosition)
      .then((cleanup) => {
        unlisten = cleanup;
      })
      .catch((error) => console.warn("Failed to bind window move events", error));

    return () => unlisten();
  }, [isHydrated, saveWindowPosition, settings.widgetMode]);

  if (!isHydrated) {
    return <main className="h-screen w-screen bg-transparent" />;
  }

  if (settings.widgetMode === "floating_icon") {
    return <FloatingIcon />;
  }

  if (settings.widgetMode === "todo_panel") {
    return <TodoPanel />;
  }

  return null;
}
