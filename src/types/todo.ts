export type TodoStatus = "pending" | "completed";

export interface TodoItem {
  id: string;
  title: string;
  status: TodoStatus;
  isImportant: boolean;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}
