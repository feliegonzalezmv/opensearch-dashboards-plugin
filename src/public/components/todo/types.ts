export type ViewType = "list" | "kanban";

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: "planned" | "in_progress" | "completed" | "error";
  priority: "low" | "medium" | "high";
  tags: string[];
  createdAt: string;
}
