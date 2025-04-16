import React, { useState } from "react";
import {
  EuiDragDropContext,
  EuiDraggable,
  EuiDroppable,
  EuiPanel,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiButton,
  EuiIcon,
} from "@elastic/eui";

interface Todo {
  id: string;
  title: string;
  description: string;
  status: "planned" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  tags: string[];
  createdAt: string;
}

// Mock data
const initialTodos: Todo[] = [
  {
    id: "1",
    title: "Implementar autenticación",
    description: "Configurar sistema de autenticación con OAuth",
    status: "planned",
    priority: "high",
    tags: ["security", "auth"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Diseñar UI dashboard",
    description: "Crear mockups para el dashboard principal",
    status: "in_progress",
    priority: "medium",
    tags: ["design", "ui"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Testing E2E",
    description: "Implementar pruebas end-to-end",
    status: "completed",
    priority: "low",
    tags: ["testing"],
    createdAt: new Date().toISOString(),
  },
];

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const onDragEnd = ({ source, destination }: any) => {
    if (!destination) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(source.index, 1);
    const newStatus = destination.droppableId as Todo["status"];
    reorderedItem.status = newStatus;

    const destinationTodos = items.filter((todo) => todo.status === newStatus);
    destinationTodos.splice(destination.index, 0, reorderedItem);

    const newTodos = [
      ...items.filter((todo) => todo.status !== newStatus),
      ...destinationTodos,
    ];

    setTodos(newTodos);
  };

  const getListByStatus = (status: Todo["status"]) =>
    todos.filter((todo) => todo.status === status);

  const getStatusTitle = (status: Todo["status"]) => {
    switch (status) {
      case "planned":
        return "Planificado";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Completado";
    }
  };

  const renderTodoItem = (todo: Todo) => (
    <EuiDraggable
      key={todo.id}
      index={todos.findIndex((t) => t.id === todo.id)}
      draggableId={todo.id}
      customDragHandle
    >
      {(provided) => (
        <EuiPanel paddingSize="m" style={{ marginBottom: "10px" }}>
          <EuiFlexGroup alignItems="center" gutterSize="s">
            <EuiFlexItem grow={false}>
              <div {...provided.dragHandleProps}>
                <EuiIcon type="grab" />
              </div>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText>
                <h4>{todo.title}</h4>
                <p>{todo.description}</p>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      )}
    </EuiDraggable>
  );

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiButton fill onClick={() => {}}>
            Nueva Tarea
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiDragDropContext onDragEnd={onDragEnd}>
        <EuiFlexGroup>
          {(["planned", "in_progress", "completed"] as const).map((status) => (
            <EuiFlexItem key={status}>
              <EuiPanel paddingSize="m">
                <EuiText>
                  <h3>{getStatusTitle(status)}</h3>
                </EuiText>
                <EuiSpacer />
                <EuiDroppable
                  droppableId={status}
                  spacing="m"
                  style={{ minHeight: "400px" }}
                >
                  {getListByStatus(status).map((todo) => renderTodoItem(todo))}
                </EuiDroppable>
              </EuiPanel>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiDragDropContext>
    </>
  );
};

export default TodoList;
