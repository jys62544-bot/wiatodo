import { Check, GripVertical, Pencil, RotateCcw, Save, Star, Trash2, X } from "lucide-react";
import { FormEvent, KeyboardEvent, PointerEvent, useState } from "react";
import type { TodoItem } from "../types/todo";

interface TodoItemRowProps {
  todo: TodoItem;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onStartReorder?: (id: string, event: PointerEvent<HTMLElement>) => void;
  dragPlacement?: "before" | "after" | null;
  isDragging?: boolean;
  onToggleImportant: (id: string) => void;
}

export function TodoItemRow({
  todo,
  onComplete,
  onReopen,
  onDelete,
  onEdit,
  onStartReorder,
  dragPlacement = null,
  isDragging = false,
  onToggleImportant,
}: TodoItemRowProps) {
  const isCompleted = todo.status === "completed";
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);
  const [hasEditError, setHasEditError] = useState(false);

  function startEditing() {
    setDraftTitle(todo.title);
    setHasEditError(false);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftTitle(todo.title);
    setHasEditError(false);
    setIsEditing(false);
  }

  function saveEdit(event?: FormEvent) {
    event?.preventDefault();
    const trimmed = draftTitle.trim();

    if (!trimmed) {
      setHasEditError(true);
      return;
    }

    onEdit(todo.id, trimmed);
    setHasEditError(false);
    setIsEditing(false);
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  return (
    <li
      data-todo-id={todo.id}
      className={`group flex items-start gap-2 rounded-md border px-2.5 py-2 transition ${
        todo.isImportant
          ? "border-amber-300 bg-amber-50"
          : isCompleted
            ? "border-slate-100 bg-white/70"
            : "border-slate-200 bg-white"
      } ${dragPlacement === "before" ? "ring-2 ring-blue-200 ring-offset-1" : ""} ${
        dragPlacement === "after" ? "ring-2 ring-blue-300 ring-offset-1" : ""
      } ${isDragging ? "opacity-30" : ""}`}
    >
      {onStartReorder && !isEditing ? (
        <div
          role="button"
          aria-label="拖动排序"
          className="mt-0.5 flex h-5 w-4 shrink-0 cursor-grab touch-none select-none items-center justify-center text-slate-300 transition hover:text-slate-500 active:cursor-grabbing"
          title="拖动排序"
          onPointerDown={(event) => onStartReorder(todo.id, event)}
        >
          <GripVertical size={14} />
        </div>
      ) : null}
      <button
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
          isCompleted ? "border-blue-400 bg-blue-500 text-white" : "border-slate-300 bg-white text-transparent"
        }`}
        type="button"
        title={isCompleted ? "取消完成" : "完成"}
        onClick={() => (isCompleted ? onReopen(todo.id) : onComplete(todo.id))}
      >
        {isCompleted ? <Check size={13} strokeWidth={3} /> : <span className="h-2 w-2 rounded-sm bg-slate-200" />}
      </button>
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <form className="flex gap-1.5" onSubmit={saveEdit}>
            <input
              className={`min-w-0 flex-1 rounded border bg-white px-2 py-1 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                hasEditError ? "border-red-300" : "border-slate-200"
              }`}
              value={draftTitle}
              autoFocus
              onChange={(event) => {
                setDraftTitle(event.target.value);
                setHasEditError(false);
              }}
              onKeyDown={handleEditKeyDown}
            />
            <button className="icon-btn text-blue-600" type="submit" title="保存">
              <Save size={14} />
            </button>
            <button className="icon-btn" type="button" title="取消" onClick={cancelEditing}>
              <X size={14} />
            </button>
          </form>
        ) : (
          <p
            className={`whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-5 ${
              isCompleted ? "text-slate-400 line-through" : "text-slate-800"
            }`}
          >
            {todo.title}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!isEditing ? (
          <button className="icon-btn" type="button" title="编辑" onClick={startEditing}>
            <Pencil size={14} />
          </button>
        ) : null}
        {isCompleted ? (
          <button className="icon-btn" type="button" title="取消完成" onClick={() => onReopen(todo.id)}>
            <RotateCcw size={15} />
          </button>
        ) : (
          <button
            className={`icon-btn ${todo.isImportant ? "text-amber-600" : ""}`}
            type="button"
            title={todo.isImportant ? "取消重要" : "标记重要"}
            onClick={() => onToggleImportant(todo.id)}
          >
            <Star size={15} fill={todo.isImportant ? "currentColor" : "none"} />
          </button>
        )}
        <button className="icon-btn-danger" type="button" title="删除" onClick={() => onDelete(todo.id)}>
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}
