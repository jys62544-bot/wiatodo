import { ChevronDown, EyeOff, Lock, Unlock } from "lucide-react";
import type { PointerEvent } from "react";

interface HeaderBarProps {
  pendingCount: number;
  isLocked: boolean;
  onCollapse: () => void;
  onHideToTray: () => void;
  onStartDrag?: () => void;
  onToggleLocked: () => void;
}

export function HeaderBar({
  pendingCount,
  isLocked,
  onCollapse,
  onHideToTray,
  onStartDrag,
  onToggleLocked,
}: HeaderBarProps) {
  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (!onStartDrag || event.button !== 0) {
      return;
    }

    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    onStartDrag();
  }

  return (
    <header
      className={`flex items-center justify-between border-b border-slate-100 px-4 py-3 ${onStartDrag ? "cursor-move" : ""}`}
      onPointerDown={handlePointerDown}
    >
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-slate-900">Today Todo</h1>
        <p className="text-xs text-slate-400">{pendingCount} pending</p>
      </div>
      <div className="flex items-center gap-1">
        <button className="icon-btn" type="button" title={isLocked ? "解锁位置" : "锁定位置"} onClick={onToggleLocked}>
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
        <button className="icon-btn" type="button" title="收起" onClick={onCollapse}>
          <ChevronDown size={17} />
        </button>
        <button className="icon-btn" type="button" title="隐藏到托盘" onClick={onHideToTray}>
          <EyeOff size={16} />
        </button>
      </div>
    </header>
  );
}
