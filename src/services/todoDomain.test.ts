import { describe, expect, it } from "vitest";
import {
  addTodo,
  addTodosBatch,
  clearCompleted,
  completeTodo,
  createDefaultSettings,
  createTodo,
  deleteTodo,
  getCompletedTodos,
  getPendingTodos,
  reopenTodo,
  toggleImportant,
} from "./todoDomain";
import type { TodoItem } from "../types/todo";

describe("todoDomain", () => {
  it("creates trimmed pending todos and rejects blank titles", () => {
    const todo = createTodo("  写测试  ", 100);

    expect(todo).toMatchObject({
      title: "写测试",
      status: "pending",
      isImportant: false,
      createdAt: 100,
      updatedAt: 100,
      completedAt: null,
    });
    expect(() => createTodo("   ", 100)).toThrow("Todo title cannot be empty");
  });

  it("updates todo state for complete, reopen, important, delete, and clear completed", () => {
    const first = createTodo("第一条", 100);
    const second = createTodo("第二条", 200);
    let todos: TodoItem[] = [first, second];

    todos = completeTodo(todos, first.id, 300);
    expect(todos.find((todo) => todo.id === first.id)).toMatchObject({
      status: "completed",
      completedAt: 300,
      updatedAt: 300,
    });

    todos = reopenTodo(todos, first.id, 400);
    expect(todos.find((todo) => todo.id === first.id)).toMatchObject({
      status: "pending",
      completedAt: null,
      updatedAt: 400,
    });

    todos = toggleImportant(todos, first.id, 500);
    expect(todos.find((todo) => todo.id === first.id)?.isImportant).toBe(true);

    todos = deleteTodo(todos, second.id);
    expect(todos.map((todo) => todo.id)).toEqual([first.id]);

    todos = completeTodo(addTodo(todos, "第三条", 600), first.id, 700);
    expect(clearCompleted(todos).some((todo) => todo.id === first.id)).toBe(false);
  });

  it("sorts pending important-first by updatedAt and completed by completedAt", () => {
    const oldImportant = { ...createTodo("旧重要", 100), isImportant: true, updatedAt: 100 };
    const newNormal = { ...createTodo("新普通", 200), updatedAt: 400 };
    const newImportant = { ...createTodo("新重要", 300), isImportant: true, updatedAt: 300 };
    const completedOlder = {
      ...createTodo("早完成", 50),
      status: "completed" as const,
      completedAt: 500,
      updatedAt: 500,
    };
    const completedNewer = {
      ...createTodo("晚完成", 60),
      status: "completed" as const,
      completedAt: 700,
      updatedAt: 700,
    };

    expect(getPendingTodos([oldImportant, newNormal, newImportant]).map((todo) => todo.title)).toEqual([
      "新重要",
      "旧重要",
      "新普通",
    ]);
    expect(getCompletedTodos([completedOlder, completedNewer]).map((todo) => todo.title)).toEqual([
      "晚完成",
      "早完成",
    ]);
  });

  it("batch-adds titles as pending todos and exposes required default settings", () => {
    const todos = addTodosBatch([], ["  A  ", "", "B"], 1000);

    expect(todos.map((todo) => todo.title)).toEqual(["A", "B"]);
    expect(todos.every((todo) => todo.status === "pending")).toBe(true);
    expect(createDefaultSettings()).toEqual({
      widgetMode: "floating_icon",
      isLocked: false,
      windowPosition: null,
      panelSize: { width: 420, height: 600 },
      launchAtStartup: false,
    });
  });
});
