import React from "react";
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
} from "@elastic/eui";
import { Todo } from "./types";

interface KanbanViewProps {
  todos: Todo[];
  onStatusChange: (todoId: string, newStatus: Todo["status"]) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ todos, onStatusChange }) => {
  const onDragEnd = ({ source, destination }: any) => {
    if (!destination) return;

    const newStatus = destination.droppableId as Todo["status"];
    onStatusChange(source.draggableId, newStatus);
  };

  const getListByStatus = (status: Todo["status"]) =>
    todos.filter((todo) => todo.status === status);

  const getStatusTitle = (status: Todo["status"]) => {
    switch (status) {
      case "planned":
        return "Planned";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
    }
  };

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

  const renderTodoItem = (todo: Todo) => (
    <EuiDraggable
      key={todo.id}
      index={todos.findIndex((t) => t.id === todo.id)}
      draggableId={todo.id}
      customDragHandle
    >
      {(provided) => (
        <div style={{ marginBottom: "10px" }}>
          <EuiCard
            textAlign="left"
            title={
              <EuiFlexGroup alignItems="center" gutterSize="s">
                <EuiFlexItem grow={false}>
                  <div {...provided.dragHandleProps}>
                    <EuiIcon type="grab" />
                  </div>
                </EuiFlexItem>
                <EuiFlexItem>{todo.title}</EuiFlexItem>
              </EuiFlexGroup>
            }
            description={
              <EuiFlexGroup direction="column" gutterSize="s">
                <EuiFlexItem>
                  <EuiBadge color={getPriorityColor(todo.priority)}>
                    {todo.priority.charAt(0).toUpperCase() +
                      todo.priority.slice(1)}
                  </EuiBadge>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFlexGroup wrap gutterSize="xs">
                    {todo.tags.map((tag) => (
                      <EuiFlexItem grow={false} key={tag}>
                        <EuiBadge
                          color="hollow"
                          style={{
                            backgroundColor: "#f0f0f0",
                            borderRadius: "16px",
                            padding: "4px 8px",
                          }}
                        >
                          {tag}
                        </EuiBadge>
                      </EuiFlexItem>
                    ))}
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            }
          />
        </div>
      )}
    </EuiDraggable>
  );

  return (
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
  );
};

export default KanbanView;
