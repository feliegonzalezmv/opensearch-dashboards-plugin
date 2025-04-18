import React, { useCallback, useMemo } from "react";
import {
  EuiDragDropContext,
  EuiDraggable,
  EuiDroppable,
  EuiPanel,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiIcon,
  EuiBadge,
  EuiCard,
  EuiToolTip,
  EuiButtonIcon,
  EuiHorizontalRule,
} from "@elastic/eui";
import { Todo } from "./types";

interface KanbanViewProps {
  todos: Todo[];
  onStatusChange: (todoId: string, newStatus: Todo["status"]) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (todoId: string) => void;
}

const TodoItem = React.memo(
  ({
    todo,
    index,
    onEdit,
    onDelete,
    dragHandleProps,
  }: {
    todo: Todo;
    index: number;
    onEdit?: (todo: Todo) => void;
    onDelete?: (todoId: string) => void;
    dragHandleProps: any;
  }) => {
    const getPriorityColor = (priority: Todo["priority"]) => {
      switch (priority) {
        case "low":
          return "success";
        case "medium":
          return "warning";
        case "high":
          return "danger";
      }
    };

    return (
      <div style={{ marginBottom: "10px" }}>
        <EuiCard
          textAlign="left"
          paddingSize="s"
          title={
            <EuiFlexGroup alignItems="center" gutterSize="s">
              <EuiFlexItem grow={false}>
                <div {...dragHandleProps}>
                  <EuiIcon type="grab" size="s" />
                </div>
              </EuiFlexItem>
              <EuiFlexItem grow={true}>
                <EuiText size="s">
                  <strong>{todo.title}</strong>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup gutterSize="xs">
                  <EuiFlexItem grow={false}>
                    <EuiToolTip content="Edit">
                      <EuiButtonIcon
                        size="s"
                        color="primary"
                        iconType="pencil"
                        aria-label="Edit"
                        onClick={() => onEdit?.(todo)}
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiToolTip content="Delete">
                      <EuiButtonIcon
                        size="s"
                        color="danger"
                        iconType="trash"
                        aria-label="Delete"
                        onClick={() => onDelete?.(todo.id)}
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          }
        >
          <EuiFlexGroup direction="column" gutterSize="xs">
            <EuiFlexItem grow={false}>
              <EuiToolTip content={todo.description}>
                <EuiText
                  size="xs"
                  color="subdued"
                  style={{ cursor: "pointer" }}
                >
                  {todo.description?.length > 100
                    ? `${todo.description.substring(0, 100)}...`
                    : todo.description}
                </EuiText>
              </EuiToolTip>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiHorizontalRule margin="xs" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="xs" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiBadge color={getPriorityColor(todo.priority)}>
                    {todo.priority.charAt(0).toUpperCase() +
                      todo.priority.slice(1)}
                  </EuiBadge>
                </EuiFlexItem>
                {todo.tags.map((tag) => (
                  <EuiFlexItem grow={false} key={tag}>
                    <EuiBadge
                      color="hollow"
                      style={{
                        backgroundColor: "#f0f0f0",
                        borderRadius: "16px",
                        padding: "2px 6px",
                      }}
                    >
                      {tag}
                    </EuiBadge>
                  </EuiFlexItem>
                ))}
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiCard>
      </div>
    );
  }
);

const KanbanView: React.FC<KanbanViewProps> = ({
  todos,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const onDragEnd = useCallback(
    ({ source, destination }: any) => {
      if (!destination) return;

      const sourceList = getListByStatus(source.droppableId as Todo["status"]);
      const todo = sourceList[source.index];

      if (!todo) {
        console.error(
          "Todo not found at index:",
          source.index,
          "in list:",
          sourceList
        );
        return;
      }

      const newStatus = destination.droppableId as Todo["status"];

      onStatusChange(todo.id, newStatus);
    },
    [onStatusChange]
  );

  const getListByStatus = useCallback(
    (status: Todo["status"]) => todos.filter((todo) => todo.status === status),
    [todos]
  );

  const getStatusTitle = useCallback((status: Todo["status"]) => {
    switch (status) {
      case "planned":
        return "Planned";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "error":
        return "Error";
    }
  }, []);

  const getStatusColor = useCallback((status: Todo["status"]) => {
    switch (status) {
      case "planned":
        return "default";
      case "in_progress":
        return "primary";
      case "completed":
        return "success";
      case "error":
        return "danger";
    }
  }, []);

  const renderTodoItem = useCallback(
    (todo: Todo, index: number) => (
      <EuiDraggable
        key={todo.id}
        index={index}
        draggableId={todo.id}
        customDragHandle
      >
        {(provided) => (
          <TodoItem
            todo={todo}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandleProps={provided.dragHandleProps}
          />
        )}
      </EuiDraggable>
    ),
    [onEdit, onDelete]
  );

  const statusColumns = useMemo(
    () =>
      (["planned", "in_progress", "completed", "error"] as const).map(
        (status) => {
          const statusTodos = getListByStatus(status);
          return (
            <EuiFlexItem key={status}>
              <EuiPanel paddingSize="m">
                <EuiFlexGroup alignItems="center" gutterSize="s">
                  <EuiFlexItem>
                    <EuiText>
                      <h3>
                        <EuiBadge color={getStatusColor(status)}>
                          {getStatusTitle(status)}
                        </EuiBadge>
                      </h3>
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiBadge color="default">{statusTodos.length}</EuiBadge>
                  </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer size="s" />
                <EuiDroppable
                  droppableId={status}
                  spacing="m"
                  style={{
                    minHeight: "400px",
                    padding: "8px",
                    backgroundColor: status === "error" ? "#FFF5F5" : "#F5F7FA",
                    borderRadius: "4px",
                  }}
                >
                  {statusTodos.map((todo, index) =>
                    renderTodoItem(todo, index)
                  )}
                </EuiDroppable>
              </EuiPanel>
            </EuiFlexItem>
          );
        }
      ),
    [getListByStatus, getStatusColor, getStatusTitle, renderTodoItem]
  );

  return (
    <EuiDragDropContext onDragEnd={onDragEnd}>
      <EuiFlexGroup gutterSize="s">{statusColumns}</EuiFlexGroup>
    </EuiDragDropContext>
  );
};

export default React.memo(KanbanView);
