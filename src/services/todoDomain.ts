import type { AppSettings } from "../types/settings";
import type { TodoGroups, TodoItem } from "../types/todo";

export function createDefaultSettings(): AppSettings {
  return {
    widgetMode: "floating_icon",
    isLocked: false,
    windowPosition: null,
    panelSize: { width: 420, height: 600 },
    launchAtStartup: false,
    activeTodoScope: "longTerm",
  };
}

export function createDefaultTodoGroups(): TodoGroups {
  return {
    shortTerm: [],
    longTerm: [],
  };
}

export function createTodo(title: string, now = Date.now()): TodoItem {
  const trimmed = title.trim();

  if (!trimmed) {
    throw new Error("Todo title cannot be empty");
  }

  return {
    id: createId(),
    title: trimmed,
    status: "pending",
    isImportant: false,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

export function addTodo(todos: TodoItem[], title: string, now = Date.now()): TodoItem[] {
  const trimmed = title.trim();

  if (!trimmed) {
    return todos;
  }

  return [createTodo(trimmed, now), ...todos];
}

export function addTodosBatch(todos: TodoItem[], titles: string[], now = Date.now()): TodoItem[] {
  const newTodos = titles
    .map((title) => title.trim())
    .filter(Boolean)
    .map((title, index) => createTodo(title, now + index));

  return [...newTodos, ...todos];
}

export function deleteTodo(todos: TodoItem[], id: string): TodoItem[] {
  return todos.filter((todo) => todo.id !== id);
}

export function editTodo(todos: TodoItem[], id: string, title: string, now = Date.now()): TodoItem[] {
  const trimmed = title.trim();

  if (!trimmed) {
    return todos;
  }

  return todos.map((todo) =>
    todo.id === id
      ? {
          ...todo,
          title: trimmed,
          updatedAt: now,
        }
      : todo,
  );
}

export function reorderTodo(
  todos: TodoItem[],
  draggedId: string,
  targetId: string,
  placement: "before" | "after",
): TodoItem[] {
  if (draggedId === targetId) {
    return todos;
  }

  const draggedIndex = todos.findIndex((todo) => todo.id === draggedId);
  const targetIndex = todos.findIndex((todo) => todo.id === targetId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return todos;
  }

  const nextTodos = todos.slice();
  const [draggedTodo] = nextTodos.splice(draggedIndex, 1);
  const adjustedTargetIndex = nextTodos.findIndex((todo) => todo.id === targetId);
  const insertIndex = placement === "before" ? adjustedTargetIndex : adjustedTargetIndex + 1;
  nextTodos.splice(insertIndex, 0, draggedTodo);

  return nextTodos;
}

export function completeTodo(todos: TodoItem[], id: string, now = Date.now()): TodoItem[] {
  return todos.map((todo) =>
    todo.id === id
      ? {
          ...todo,
          status: "completed",
          completedAt: now,
          updatedAt: now,
        }
      : todo,
  );
}

export function reopenTodo(todos: TodoItem[], id: string, now = Date.now()): TodoItem[] {
  return todos.map((todo) =>
    todo.id === id
      ? {
          ...todo,
          status: "pending",
          completedAt: null,
          updatedAt: now,
        }
      : todo,
  );
}

export function toggleImportant(todos: TodoItem[], id: string, now = Date.now()): TodoItem[] {
  const target = todos.find((todo) => todo.id === id);

  if (!target) {
    return todos;
  }

  const updatedTodo = {
    ...target,
    isImportant: !target.isImportant,
    updatedAt: now,
  };
  const remainingTodos = todos.filter((todo) => todo.id !== id);

  return updatedTodo.isImportant
    ? [updatedTodo, ...remainingTodos]
    : todos.map((todo) => (todo.id === id ? updatedTodo : todo));
}

export function clearCompleted(todos: TodoItem[]): TodoItem[] {
  return todos.filter((todo) => todo.status !== "completed");
}

export function getPendingTodos(todos: TodoItem[]): TodoItem[] {
  return todos.filter((todo) => todo.status === "pending");
}

export function getCompletedTodos(todos: TodoItem[]): TodoItem[] {
  return todos
    .filter((todo) => todo.status === "completed")
    .slice()
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
