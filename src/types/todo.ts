export type TodoStatus = "pending" | "completed";
export type TodoScope = "shortTerm" | "longTerm";

export interface TodoItem {
  id: string;
  title: string;
  status: TodoStatus;
  isImportant: boolean;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export type TodoGroups = Record<TodoScope, TodoItem[]>;
