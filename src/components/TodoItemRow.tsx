import { Check, RotateCcw, Star, Trash2 } from "lucide-react";
import type { TodoItem } from "../types/todo";

interface TodoItemRowProps {
  todo: TodoItem;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleImportant: (id: string) => void;
}

export function TodoItemRow({ todo, onComplete, onReopen, onDelete, onToggleImportant }: TodoItemRowProps) {
  const isCompleted = todo.status === "completed";

  return (
    <li
      className={`group flex items-start gap-2 rounded-md border px-2.5 py-2 transition ${
        todo.isImportant
          ? "border-amber-300 bg-amber-50"
          : isCompleted
            ? "border-slate-100 bg-white/70"
            : "border-slate-200 bg-white"
      }`}
    >
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
        <p
          className={`whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-5 ${
            isCompleted ? "text-slate-400 line-through" : "text-slate-800"
          }`}
        >
          {todo.title}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
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
