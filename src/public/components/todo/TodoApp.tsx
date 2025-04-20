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
import ReportsView from "./ReportsView";
import TodoModal from "./TodoModal";
import { Todo, ViewType } from "./types";
import * as todoApi from "./services/todoApi";

// Mock data for initial development
const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [viewType, setViewType] = useState<ViewType>("list");
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

  const renderView = () => {
    if (isLoading) {
      return (
        <EuiFlexGroup justifyContent="center">
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner size="xl" />
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    }

    if (error) {
      return (
        <EuiText color="danger">
          <p>{error}</p>
        </EuiText>
      );
    }

    switch (viewType) {
      case "list":
        return (
          <ListView
            todos={todos}
            onStatusChange={handleStatusChange}
            onEdit={openEditModal}
            onDelete={handleDeleteTodo}
          />
        );
      case "kanban":
        return (
          <KanbanView
            todos={todos}
            onStatusChange={handleStatusChange}
            onEdit={openEditModal}
            onDelete={handleDeleteTodo}
          />
        );
      case "reports":
        return <ReportsView todos={todos} />;
      default:
        return null;
    }
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
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      color={viewType === "reports" ? "primary" : "text"}
                      onClick={() => setViewType("reports")}
                    >
                      Reports
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                {viewType !== "reports" && (
                  <EuiFieldSearch
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    isClearable
                    onClear={clearSearch}
                  />
                )}
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer size="m" />

            {renderView()}

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
