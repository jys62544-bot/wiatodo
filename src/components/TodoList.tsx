import type { TodoItem } from "../types/todo";
import { EmptyState } from "./EmptyState";
import { TodoItemRow } from "./TodoItemRow";

interface TodoListProps {
  todos: TodoItem[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleImportant: (id: string) => void;
}

export function TodoList({ todos, onComplete, onDelete, onToggleImportant }: TodoListProps) {
  if (todos.length === 0) {
    return <EmptyState text="暂无待办，添加一个新的事项吧" />;
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItemRow
          key={todo.id}
          todo={todo}
          onComplete={onComplete}
          onDelete={onDelete}
          onReopen={() => undefined}
          onToggleImportant={onToggleImportant}
        />
      ))}
    </ul>
  );
}
