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
  EuiLoadingSpinner,
  EuiSelect,
  EuiBadge,
} from "@elastic/eui";
import ListView from "./ListView";
import KanbanView from "./KanbanView";
import ReportsView from "./ReportsView";
import TodoModal from "./TodoModal";
import { Todo, ViewType, TodoStatus, TodoPriority } from "./types";
import { useTodos } from "./hooks/useTodos";

// Main TodoApp component
const TodoApp: React.FC = () => {
  const {
    todos,
    filteredTodos,
    loading,
    error,
    searchTerm,
    statusFilter,
    priorityFilter,
    tagFilter,
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    setTagFilter,
    createTodo,
    updateTodo,
    deleteTodo,
    updateTodoStatus,
  } = useTodos();

  const [viewType, setViewType] = useState<ViewType>("list");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Get unique tags from all todos for filter dropdown
  const uniqueTags = React.useMemo(() => {
    const tags = new Set<string>();
    todos.forEach((todo) => {
      todo.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [todos]);

  const handleCreateTodo = async (todoData: Omit<Todo, "id" | "createdAt">) => {
    try {
      await createTodo(todoData);
      setToastMessage("Task created successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setIsModalVisible(false);
    } catch (err) {
      console.error("Failed to create todo:", err);
    }
  };

  const handleEditTodo = async (todoData: Omit<Todo, "id" | "createdAt">) => {
    if (editingTodo) {
      try {
        await updateTodo(editingTodo.id, todoData);
        setToastMessage("Task updated successfully!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setIsModalVisible(false);
      } catch (err) {
        console.error("Failed to update todo:", err);
      }
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await deleteTodo(todoId);
      setToastMessage("Task deleted successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Failed to delete todo:", err);
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
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value as TodoStatus | "all");
  };

  const handlePriorityFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPriorityFilter(e.target.value as TodoPriority | "all");
  };

  const handleTagFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTagFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setTagFilter("all");
  };

  const renderView = () => {
    if (loading) {
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
          <p>{error.message}</p>
        </EuiText>
      );
    }

    switch (viewType) {
      case "list":
        return (
          <ListView
            todos={filteredTodos}
            onStatusChange={updateTodoStatus}
            onEdit={openEditModal}
            onDelete={handleDeleteTodo}
          />
        );
      case "kanban":
        return (
          <KanbanView
            todos={filteredTodos}
            onStatusChange={updateTodoStatus}
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
                      Kanban Board
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
              <EuiFlexItem>
                <EuiFieldSearch
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  isClearable={true}
                  onClear={clearSearch}
                  fullWidth
                />
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer size="m" />

            {/* Filters */}
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiSelect
                  prepend="Status"
                  options={[
                    { value: "all", text: "All Statuses" },
                    { value: "planned", text: "Planned" },
                    { value: "in_progress", text: "In Progress" },
                    { value: "completed", text: "Completed" },
                    { value: "error", text: "Error" },
                  ]}
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  aria-label="Status filter"
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiSelect
                  prepend="Priority"
                  options={[
                    { value: "all", text: "All Priorities" },
                    { value: "low", text: "Low" },
                    { value: "medium", text: "Medium" },
                    { value: "high", text: "High" },
                  ]}
                  value={priorityFilter}
                  onChange={handlePriorityFilterChange}
                  aria-label="Priority filter"
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiSelect
                  prepend="Tag"
                  options={[
                    { value: "all", text: "All Tags" },
                    ...uniqueTags.map((tag) => ({ value: tag, text: tag })),
                  ]}
                  value={tagFilter}
                  onChange={handleTagFilterChange}
                  aria-label="Tag filter"
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty onClick={clearFilters}>
                  Clear Filters
                </EuiButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer size="m" />

            {/* Active filters indicator */}
            {(statusFilter !== "all" ||
              priorityFilter !== "all" ||
              tagFilter !== "all") && (
              <>
                <EuiFlexGroup gutterSize="s" wrap>
                  {statusFilter !== "all" && (
                    <EuiFlexItem grow={false}>
                      <EuiBadge
                        color="primary"
                        onClick={() => setStatusFilter("all")}
                      >
                        Status: {statusFilter} ✕
                      </EuiBadge>
                    </EuiFlexItem>
                  )}
                  {priorityFilter !== "all" && (
                    <EuiFlexItem grow={false}>
                      <EuiBadge
                        color="primary"
                        onClick={() => setPriorityFilter("all")}
                      >
                        Priority: {priorityFilter} ✕
                      </EuiBadge>
                    </EuiFlexItem>
                  )}
                  {tagFilter !== "all" && (
                    <EuiFlexItem grow={false}>
                      <EuiBadge
                        color="primary"
                        onClick={() => setTagFilter("all")}
                      >
                        Tag: {tagFilter} ✕
                      </EuiBadge>
                    </EuiFlexItem>
                  )}
                </EuiFlexGroup>
                <EuiSpacer size="s" />
              </>
            )}

            {renderView()}

            {showToast && (
              <EuiToast
                title="Notification"
                color="success"
                iconType="check"
                onClose={() => setShowToast(false)}
              >
                <p>{toastMessage}</p>
              </EuiToast>
            )}

            {isModalVisible && (
              <TodoModal
                isVisible={isModalVisible}
                onClose={closeModal}
                onSave={editingTodo ? handleEditTodo : handleCreateTodo}
                initialTodo={editingTodo}
              />
            )}
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default TodoApp;
