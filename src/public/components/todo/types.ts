export interface Todo {
  id: string;
  title: string;
  description: string;
  status: "planned" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  tags: string[];
  createdAt: string;
}

export type ViewType = "list" | "kanban";
