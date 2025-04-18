import React, { useState, useEffect } from "react";
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
  EuiSpacer,
  EuiText,
  EuiFieldSearch,
  EuiToast,
  EuiLoadingSpinner,
} from "@elastic/eui";
import ListView from "./ListView";
import KanbanView from "./KanbanView";
import TodoModal from "./TodoModal";
import { Todo } from "./types";
import * as todoApi from "./services/todoApi";

// Mock data for initial development
const initialTodos: Todo[] = [
  {
    id: "1",
    title: "PCI DSS Compliance Review",
    description:
      "Conduct quarterly review of PCI DSS compliance requirements and document findings.",
    status: "planned",
    priority: "high",
    tags: ["pci-dss", "compliance", "security"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Security Patch Implementation",
    description:
      "Apply latest security patches to all systems and verify successful installation.",
    status: "in_progress",
    priority: "high",
    tags: ["security", "maintenance", "critical"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "ISO 27001 Documentation Update",
    description:
      "Update information security policies and procedures according to ISO 27001 standards.",
    status: "completed",
    priority: "medium",
    tags: ["iso-27001", "documentation", "compliance"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Vulnerability Assessment",
    description:
      "Perform quarterly vulnerability assessment on all systems and address critical findings.",
    status: "planned",
    priority: "high",
    tags: ["security", "vulnerability", "assessment"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Security Awareness Training",
    description:
      "Conduct annual security awareness training for all employees and document completion.",
    status: "planned",
    priority: "medium",
    tags: ["training", "awareness", "security"],
    createdAt: new Date().toISOString(),
  },
];

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [viewType, setViewType] = useState<"list" | "kanban">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTodos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTodos = await todoApi.getAllTodos();
        setTodos(fetchedTodos);
      } catch (err) {
        console.error("Failed to load todos:", err);
        setError("Failed to load todos. Please try again later.");

        setTodos(initialTodos);
      } finally {
        setIsLoading(false);
      }
    };
    loadTodos();
  }, []);

  useEffect(() => {
    const searchTodos = async () => {
      if (!searchQuery.trim()) {
        try {
          const fetchedTodos = await todoApi.getAllTodos();
          setTodos(fetchedTodos);
        } catch (err) {
          console.error("Failed to load todos:", err);
          setError("Failed to load todos. Please try again later.");
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const searchResults = await todoApi.searchTodos(searchQuery);
        setTodos(searchResults);
      } catch (err) {
        console.error("Failed to search todos:", err);
        setError("Failed to search todos. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchTodos, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleStatusChange = async (
    todoId: string,
    newStatus: Todo["status"]
  ) => {
    try {
      const updatedTodo = await todoApi.updateTodo(todoId, {
        status: newStatus,
      });
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === todoId ? updatedTodo : todo))
      );
    } catch (err) {
      console.error("Failed to update todo status:", err);
      setError("Failed to update todo status. Please try again later.");
    }
  };

  const handleCreateTodo = async (todoData: Omit<Todo, "id" | "createdAt">) => {
    try {
      const newTodo = await todoApi.createTodo(todoData);
      setTodos((prevTodos) => [...prevTodos, newTodo]);
      setToastMessage("Task created successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setIsModalVisible(false);
    } catch (err) {
      console.error("Failed to create todo:", err);
      setError("Failed to create todo. Please try again later.");
    }
  };

  const handleEditTodo = async (todoData: Omit<Todo, "id" | "createdAt">) => {
    if (editingTodo) {
      try {
        const updatedTodo = await todoApi.updateTodo(editingTodo.id, todoData);
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === editingTodo.id ? updatedTodo : todo
          )
        );
        setToastMessage("Task updated successfully!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setIsModalVisible(false);
      } catch (err) {
        console.error("Failed to update todo:", err);
        setError("Failed to update todo. Please try again later.");
      }
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await todoApi.deleteTodo(todoId);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoId));
      setToastMessage("Task deleted successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Failed to delete todo:", err);
      setError("Failed to delete todo. Please try again later.");
    }
  };

  const openCreateModal = () => {
    setEditingTodo(undefined);
    setIsModalVisible(true);
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingTodo(undefined);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageContent>
          <EuiPageContentBody>
            <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiText>
                  <h1>Security Compliance Tasks</h1>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  color="primary"
                  onClick={openCreateModal}
                  iconType="plus"
                >
                  Add Task
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer size="m" />

            <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiFlexGroup>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      color={viewType === "list" ? "primary" : "text"}
                      onClick={() => setViewType("list")}
                    >
                      List View
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      color={viewType === "kanban" ? "primary" : "text"}
                      onClick={() => setViewType("kanban")}
                    >
                      Kanban View
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFieldSearch
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  isClearable
                  onClear={clearSearch}
                />
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer size="m" />

            {isLoading ? (
              <EuiFlexGroup justifyContent="center">
                <EuiFlexItem grow={false}>
                  <EuiLoadingSpinner size="xl" />
                </EuiFlexItem>
              </EuiFlexGroup>
            ) : error ? (
              <EuiText color="danger">
                <p>{error}</p>
              </EuiText>
            ) : (
              <>
                {viewType === "list" ? (
                  <ListView
                    todos={todos}
                    onStatusChange={handleStatusChange}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTodo}
                  />
                ) : (
                  <KanbanView
                    todos={todos}
                    onStatusChange={handleStatusChange}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTodo}
                  />
                )}
              </>
            )}

            {isModalVisible && (
              <TodoModal
                isVisible={isModalVisible}
                onClose={closeModal}
                onSubmit={editingTodo ? handleEditTodo : handleCreateTodo}
                todo={editingTodo}
              />
            )}

            {showToast && (
              <EuiToast
                title="Success"
                color="success"
                iconType="check"
                onClose={() => setShowToast(false)}
              >
                <p>{toastMessage}</p>
              </EuiToast>
            )}
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default TodoApp;
