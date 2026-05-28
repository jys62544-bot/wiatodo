import { CheckSquare, Lock, Unlock } from "lucide-react";
import { MouseEvent, PointerEvent, useRef } from "react";
import { useAppState, usePersistWindowPosition } from "../store/AppStateContext";
import { startWindowDrag } from "../services/windowService";
import { SystemMetricCards } from "./SystemMetricCards";

export function FloatingIcon() {
  const { settings, setWidgetMode, toggleLocked } = useAppState();
  const persistWindowPosition = usePersistWindowPosition();
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartedRef = useRef(false);

  async function openPanel() {
    if (dragStartedRef.current) {
      dragStartedRef.current = false;
      return;
    }

    await persistWindowPosition();
    setWidgetMode("todo_panel");
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || settings.isLocked) {
      return;
    }

    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    dragStartedRef.current = false;
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!pointerStartRef.current || settings.isLocked || dragStartedRef.current) {
      return;
    }

    const dx = Math.abs(event.clientX - pointerStartRef.current.x);
    const dy = Math.abs(event.clientY - pointerStartRef.current.y);

    if (dx > 4 || dy > 4) {
      dragStartedRef.current = true;
      startWindowDrag().catch((error) => console.warn("start dragging failed", error));
    }
  }

  function handleToggleLocked(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    toggleLocked();
  }

  function stopFloatingIconPointer(event: PointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  const LockIcon = settings.isLocked ? Lock : Unlock;

  return (
    <main className="flex h-screen w-screen items-center justify-start gap-1 bg-transparent">
      <div className="relative h-12 w-12 shrink-0">
        <button
          className="absolute inset-1 flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-blue-500 shadow-md shadow-slate-300/40 transition hover:border-blue-200 hover:bg-blue-50"
          type="button"
          title="打开待办"
          onClick={openPanel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => {
            const wasDragging = dragStartedRef.current;
            pointerStartRef.current = null;
            if (wasDragging) {
              window.setTimeout(() => {
                persistWindowPosition().catch((error) => console.warn("saving window position failed", error));
                dragStartedRef.current = false;
              }, 100);
            }
          }}
        >
          <CheckSquare size={23} strokeWidth={2.3} />
        </button>
        <button
          aria-pressed={settings.isLocked}
          className="absolute right-0 top-0 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 shadow-sm transition hover:border-amber-300 hover:bg-amber-100"
          type="button"
          title={settings.isLocked ? "解锁位置" : "锁定位置"}
          onClick={handleToggleLocked}
          onPointerDown={stopFloatingIconPointer}
          onPointerMove={stopFloatingIconPointer}
          onPointerUp={stopFloatingIconPointer}
        >
          <LockIcon size={11} />
        </button>
      </div>
      <SystemMetricCards />
    </main>
  );
}
