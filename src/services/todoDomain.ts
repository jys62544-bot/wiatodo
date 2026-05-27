import type { AppSettings } from "../types/settings";
import type { TodoItem } from "../types/todo";

export function createDefaultSettings(): AppSettings {
  return {
    widgetMode: "floating_icon",
    isLocked: false,
    windowPosition: null,
    panelSize: { width: 420, height: 600 },
    launchAtStartup: false,
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
  return todos.map((todo) =>
    todo.id === id
      ? {
          ...todo,
          isImportant: !todo.isImportant,
          updatedAt: now,
        }
      : todo,
  );
}

export function clearCompleted(todos: TodoItem[]): TodoItem[] {
  return todos.filter((todo) => todo.status !== "completed");
}

export function getPendingTodos(todos: TodoItem[]): TodoItem[] {
  return todos
    .filter((todo) => todo.status === "pending")
    .slice()
    .sort((a, b) => {
      if (a.isImportant !== b.isImportant) {
        return Number(b.isImportant) - Number(a.isImportant);
      }

      return b.updatedAt - a.updatedAt;
    });
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
