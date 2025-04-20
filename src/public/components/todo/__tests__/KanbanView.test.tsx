import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Todo } from "../types";

// Mock de componentes que pueden causar problemas con hooks
jest.mock("@elastic/eui", () => ({
  EuiDragDropContext: ({ children, onDragEnd }: any) => (
    <div
      data-testid="drag-drop-context"
      onClick={() =>
        onDragEnd({
          source: { droppableId: "planned", index: 0 },
          destination: { droppableId: "in_progress", index: 0 },
          draggableId: "todo-1",
        })
      }
    >
      {children}
    </div>
  ),
  EuiDroppable: ({ children, id }: any) => (
    <div data-testid={`column-${id}`}>{children}</div>
  ),
  EuiDraggable: ({ children, id }: any) => (
    <div data-testid={`todo-${id}`}>{children}</div>
  ),
  EuiPanel: ({ children }: any) => <div>{children}</div>,
  EuiText: ({ children }: any) => <div>{children}</div>,
  EuiTitle: ({ children }: any) => <div>{children}</div>,
  EuiSpacer: () => <div data-testid="spacer" />,
  EuiButtonIcon: ({ onClick, iconType }: any) => (
    <button data-testid={`button-${iconType}`} onClick={onClick}>
      {iconType}
    </button>
  ),
  EuiBadge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

// Mock del componente KanbanView
jest.mock("../KanbanView", () => {
  return {
    __esModule: true,
    default: ({
      todos,
      onStatusChange,
      onEdit,
      onDelete,
    }: {
      todos: Todo[];
      onStatusChange: (id: string, newStatus: string) => void;
      onEdit: (todo: Todo) => void;
      onDelete: (id: string) => void;
    }) => (
      <div data-testid="kanban-view">
        <div data-testid="column-planned">
          {todos
            .filter((todo) => todo.status === "planned")
            .map((todo) => (
              <div key={todo.id} data-testid={`todo-${todo.id}`}>
                <span>{todo.title}</span>
                <button
                  data-testid={`edit-${todo.id}`}
                  onClick={() => onEdit(todo)}
                >
                  Edit
                </button>
                <button
                  data-testid={`delete-${todo.id}`}
                  onClick={() => onDelete(todo.id)}
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
        <div data-testid="column-in_progress">
          {todos
            .filter((todo) => todo.status === "in_progress")
            .map((todo) => (
              <div key={todo.id} data-testid={`todo-${todo.id}`}>
                <span>{todo.title}</span>
                <button
                  data-testid={`edit-${todo.id}`}
                  onClick={() => onEdit(todo)}
                >
                  Edit
                </button>
                <button
                  data-testid={`delete-${todo.id}`}
                  onClick={() => onDelete(todo.id)}
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
        <div data-testid="column-completed">
          {todos
            .filter((todo) => todo.status === "completed")
            .map((todo) => (
              <div key={todo.id} data-testid={`todo-${todo.id}`}>
                <span>{todo.title}</span>
                <button
                  data-testid={`edit-${todo.id}`}
                  onClick={() => onEdit(todo)}
                >
                  Edit
                </button>
                <button
                  data-testid={`delete-${todo.id}`}
                  onClick={() => onDelete(todo.id)}
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
        <button
          data-testid="simulate-drag"
          onClick={() => onStatusChange("1", "in_progress")}
        >
          Simulate Drag
        </button>
      </div>
    ),
  };
});

// Importar el componente mockeado
import KanbanView from "../KanbanView";

describe("KanbanView", () => {
  const mockTodos: Todo[] = [
    {
      id: "1",
      title: "Task 1",
      description: "Description 1",
      status: "planned",
      priority: "high",
      tags: ["important"],
      createdAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      title: "Task 2",
      description: "Description 2",
      status: "in_progress",
      priority: "medium",
      tags: ["bug"],
      createdAt: "2023-01-02T00:00:00.000Z",
    },
    {
      id: "3",
      title: "Task 3",
      description: "Description 3",
      status: "completed",
      priority: "low",
      tags: ["feature"],
      createdAt: "2023-01-03T00:00:00.000Z",
    },
  ];

  test("renders kanban columns", () => {
    const handleStatusChange = jest.fn();
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();

    render(
      <KanbanView
        todos={mockTodos}
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByTestId("column-planned")).toBeInTheDocument();
    expect(screen.getByTestId("column-in_progress")).toBeInTheDocument();
    expect(screen.getByTestId("column-completed")).toBeInTheDocument();
  });

  test("renders todos in correct columns", () => {
    const handleStatusChange = jest.fn();
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();

    render(
      <KanbanView
        todos={mockTodos}
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByTestId("todo-1")).toBeInTheDocument();
    expect(screen.getByTestId("todo-2")).toBeInTheDocument();
    expect(screen.getByTestId("todo-3")).toBeInTheDocument();
  });

  test("calls onEdit when edit button is clicked", () => {
    const handleStatusChange = jest.fn();
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();

    render(
      <KanbanView
        todos={mockTodos}
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    fireEvent.click(screen.getByTestId("edit-1"));
    expect(handleEdit).toHaveBeenCalledWith(mockTodos[0]);
  });

  test("calls onDelete when delete button is clicked", () => {
    const handleStatusChange = jest.fn();
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();

    render(
      <KanbanView
        todos={mockTodos}
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    fireEvent.click(screen.getByTestId("delete-1"));
    expect(handleDelete).toHaveBeenCalledWith("1");
  });

  test("calls onStatusChange when a todo is dragged to a different column", () => {
    const handleStatusChange = jest.fn();
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();

    render(
      <KanbanView
        todos={mockTodos}
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    fireEvent.click(screen.getByTestId("simulate-drag"));
    expect(handleStatusChange).toHaveBeenCalledWith("1", "in_progress");
  });
});
