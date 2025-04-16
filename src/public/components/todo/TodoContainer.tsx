import React, { useState } from "react";
import {
  EuiPageContent,
  EuiPageContentBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonGroup,
  EuiSpacer,
  EuiButton,
} from "@elastic/eui";
import { Todo, ViewType } from "./types";
import ListView from "./ListView";
import KanbanView from "./KanbanView";

// Mock data
const initialTodos: Todo[] = [
  {
    id: "1",
    title: "Implement Authentication",
    description: "Set up OAuth authentication system",
    status: "planned",
    priority: "high",
    tags: ["security", "auth"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Design UI Dashboard",
    description: "Create mockups for main dashboard",
    status: "in_progress",
    priority: "medium",
    tags: ["design", "ui"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "E2E Testing",
    description: "Implement end-to-end tests",
    status: "completed",
    priority: "low",
    tags: ["testing"],
    createdAt: new Date().toISOString(),
  },
];

const TodoContainer: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [viewType, setViewType] = useState<ViewType>("list");

  const toggleButtons = [
    {
      id: "list",
      label: "List View",
    },
    {
      id: "kanban",
      label: "Kanban Board",
    },
  ];

  const onStatusChange = (todoId: string, newStatus: Todo["status"]) => {
    setTodos(
      todos.map((todo) =>
        todo.id === todoId ? { ...todo, status: newStatus } : todo
      )
    );
  };

  return (
    <EuiPageContent>
      <EuiPageContentBody>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonGroup
              legend="View type"
              options={toggleButtons}
              idSelected={viewType}
              onChange={(id) => setViewType(id as ViewType)}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={() => {}}>
              Add New Task
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
        {viewType === "list" ? (
          <ListView todos={todos} onStatusChange={onStatusChange} />
        ) : (
          <KanbanView todos={todos} onStatusChange={onStatusChange} />
        )}
      </EuiPageContentBody>
    </EuiPageContent>
  );
};

export default TodoContainer;
