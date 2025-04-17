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

// Mock data
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
    title: "SOX Audit Preparation",
    description:
      "Prepare documentation and evidence for upcoming SOX compliance audit.",
    status: "planned",
    priority: "high",
    tags: ["sox", "audit", "compliance"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Firewall Rule Review",
    description:
      "Review and optimize firewall rules according to security best practices.",
    status: "error",
    priority: "medium",
    tags: ["security", "review", "maintenance"],
    createdAt: new Date().toISOString(),
  },
];

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isKanban, setIsKanban] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize todos with a slight delay to ensure proper mounting
  useEffect(() => {
    const loadTodos = async () => {
      setIsLoading(true);
      try {
        // Simulate a small delay to ensure proper mounting
        await new Promise((resolve) => setTimeout(resolve, 100));
        setTodos(initialTodos);
      } finally {
        setIsLoading(false);
      }
    };
    loadTodos();
  }, []);

  const handleStatusChange = (todoId: string, newStatus: Todo["status"]) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === todoId ? { ...todo, status: newStatus } : todo
      )
    );
  };

  const handleCreateTodo = (todoData: Omit<Todo, "id" | "createdAt">) => {
    const newTodo: Todo = {
      ...todoData,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString(),
    };
    setTodos((prevTodos) => [...prevTodos, newTodo]);
    setToastMessage("Task created successfully!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setIsModalVisible(false);
  };

  const handleEditTodo = (todoData: Omit<Todo, "id" | "createdAt">) => {
    if (editingTodo) {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === editingTodo.id ? { ...todo, ...todoData } : todo
        )
      );
      setToastMessage("Task updated successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setIsModalVisible(false);
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoId));
    setToastMessage("Task deleted successfully!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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

  if (isLoading) {
    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageContent>
            <EuiPageContentBody>
              <EuiFlexGroup
                alignItems="center"
                justifyContent="center"
                style={{ minHeight: "400px" }}
              >
                <EuiFlexItem grow={false}>
                  <EuiLoadingSpinner size="xl" />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageContent>
          <EuiPageContentBody>
            {showToast && (
              <EuiToast
                title="Success"
                color="success"
                text={toastMessage}
                onClose={() => setShowToast(false)}
              />
            )}

            <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
              <EuiFlexItem>
                <EuiText>
                  <h1>Task Management</h1>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup gutterSize="s">
                  <EuiFlexItem>
                    <EuiFieldSearch
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      fullWidth
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      onClick={() => setIsKanban(!isKanban)}
                      iconType={isKanban ? "list" : "grid"}
                    >
                      {isKanban ? "List View" : "Kanban View"}
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton
                      fill
                      iconType="plus"
                      onClick={openCreateModal}
                      data-test-subj="addNewTaskButton"
                    >
                      Add New Task
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer size="l" />

            {isKanban ? (
              <KanbanView
                key={`kanban-${todos.length}`}
                todos={todos}
                onStatusChange={handleStatusChange}
                onEdit={openEditModal}
                onDelete={handleDeleteTodo}
              />
            ) : (
              <ListView
                key={`list-${todos.length}`}
                todos={todos}
                onStatusChange={handleStatusChange}
                onEdit={openEditModal}
                onDelete={handleDeleteTodo}
                searchQuery={searchQuery}
              />
            )}

            {isModalVisible && (
              <TodoModal
                isVisible={isModalVisible}
                onClose={closeModal}
                todo={editingTodo}
                onSubmit={editingTodo ? handleEditTodo : handleCreateTodo}
              />
            )}
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default TodoApp;
