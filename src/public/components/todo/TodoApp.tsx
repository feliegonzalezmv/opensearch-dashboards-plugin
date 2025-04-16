import React, { useState } from "react";
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
} from "@elastic/eui";
import { v4 as uuidv4 } from "uuid";
import ListView from "./ListView";
import KanbanView from "./KanbanView";
import TodoModal from "./TodoModal";
import { Todo } from "./types";

const initialTodos: Todo[] = [
  {
    id: uuidv4(),
    title: "PCI DSS Compliance Review",
    description:
      "Conduct quarterly review of PCI DSS compliance requirements and document findings.",
    status: "planned",
    priority: "high",
    tags: ["pci-dss", "compliance", "security"],
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "Security Patch Implementation",
    description:
      "Apply latest security patches to all systems and verify successful installation.",
    status: "in_progress",
    priority: "high",
    tags: ["security", "maintenance", "critical"],
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "ISO 27001 Documentation Update",
    description:
      "Update information security policies and procedures according to ISO 27001 standards.",
    status: "completed",
    priority: "medium",
    tags: ["iso-27001", "documentation", "compliance"],
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "SOX Audit Preparation",
    description:
      "Prepare documentation and evidence for upcoming SOX compliance audit.",
    status: "planned",
    priority: "high",
    tags: ["sox", "audit", "compliance"],
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
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
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [isKanban, setIsKanban] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleStatusChange = (todoId: string, newStatus: Todo["status"]) => {
    setTodos(
      todos.map((todo) =>
        todo.id === todoId ? { ...todo, status: newStatus } : todo
      )
    );
  };

  const handleCreateTodo = (todoData: Omit<Todo, "id" | "createdAt">) => {
    const newTodo: Todo = {
      ...todoData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setTodos([...todos, newTodo]);
    setToastMessage("Task created successfully!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleEditTodo = (todoData: Omit<Todo, "id" | "createdAt">) => {
    if (editingTodo) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingTodo.id ? { ...todo, ...todoData } : todo
        )
      );
      setToastMessage("Task updated successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    setTodos(todos.filter((todo) => todo.id !== todoId));
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
                todos={todos}
                onStatusChange={handleStatusChange}
                onEdit={openEditModal}
                onDelete={handleDeleteTodo}
              />
            ) : (
              <ListView
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
