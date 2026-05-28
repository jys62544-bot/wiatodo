import { Trash2 } from "lucide-react";
import type { TodoItem } from "../types/todo";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { TodoItemRow } from "./TodoItemRow";
import { useState } from "react";

interface CompletedListProps {
  todos: TodoItem[];
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onClearCompleted: () => void;
}

export function CompletedList({ todos, onReopen, onDelete, onEdit, onClearCompleted }: CompletedListProps) {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-normal text-slate-400">已完成 {todos.length}</h2>
        <button
          className="btn-ghost-danger"
          type="button"
          disabled={todos.length === 0}
          title="清空已完成"
          onClick={() => setIsConfirmingClear(true)}
        >
          <Trash2 size={14} />
          <span>清空</span>
        </button>
      </div>
      {todos.length === 0 ? (
        <EmptyState text="还没有完成的事项" />
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <TodoItemRow
              key={todo.id}
              todo={todo}
              onComplete={() => undefined}
              onDelete={onDelete}
              onEdit={onEdit}
              onReopen={onReopen}
              onToggleImportant={() => undefined}
            />
          ))}
        </ul>
      )}
      {isConfirmingClear ? (
        <ConfirmDialog
          title="清空已完成"
          message="确定清空所有已完成事项吗？"
          confirmText="清空"
          onCancel={() => setIsConfirmingClear(false)}
          onConfirm={() => {
            onClearCompleted();
            setIsConfirmingClear(false);
          }}
        />
      ) : null}
    </div>
  );
}
