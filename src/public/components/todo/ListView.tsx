import React, { useState } from "react";
import {
  EuiBasicTable,
  EuiBadge,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  EuiPopover,
  EuiContextMenu,
  EuiIcon,
  EuiToolTip,
  EuiButton,
} from "@elastic/eui";
import { Todo } from "./types";

interface ListViewProps {
  todos: Todo[];
  onStatusChange: (todoId: string, newStatus: Todo["status"]) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (todoId: string) => void;
  searchQuery?: string;
}

const ListView: React.FC<ListViewProps> = ({
  todos,
  onStatusChange,
  onEdit,
  onDelete,
  searchQuery = "",
}) => {
  const [sorting, setSorting] = useState({
    field: "createdAt",
    direction: "desc",
  });

  const [popoverStates, setPopoverStates] = useState<{
    [key: string]: boolean;
  }>({});

  const togglePopover = (todoId: string) => {
    setPopoverStates((prev) => ({
      ...prev,
      [todoId]: !prev[todoId],
    }));
  };

  const closePopover = (todoId: string) => {
    setPopoverStates((prev) => ({
      ...prev,
      [todoId]: false,
    }));
  };

  const columns = [
    {
      field: "title",
      name: "Title",
      sortable: true,
      width: "200px",
    },
    {
      field: "description",
      name: "Description",
      sortable: true,
      width: "150px",
      render: (description: string) => (
        <EuiToolTip content={description}>
          <EuiText size="s" style={{ cursor: "pointer" }}>
            {description?.length > 50
              ? `${description?.substring(0, 50)}...`
              : description}
          </EuiText>
        </EuiToolTip>
      ),
    },
    {
      field: "status",
      name: "Status",
      sortable: true,
      width: "150px",
      render: (status: Todo["status"], todo: Todo) => (
        <EuiPopover
          button={
            <EuiBadge
              color={getStatusColor(status)}
              onClick={() => togglePopover(todo.id)}
              onClickAriaLabel="Change status"
              style={{ cursor: "pointer" }}
            >
              {getStatusLabel(status)}
            </EuiBadge>
          }
          isOpen={popoverStates[todo.id] || false}
          closePopover={() => closePopover(todo.id)}
          panelPaddingSize="s"
        >
          <div style={{ width: "150px" }}>
            {(["planned", "in_progress", "completed", "error"] as const).map(
              (newStatus) => (
                <EuiButton
                  key={newStatus}
                  size="s"
                  fullWidth
                  color={getStatusColor(newStatus)}
                  onClick={() => {
                    onStatusChange(todo.id, newStatus);
                    closePopover(todo.id);
                  }}
                  style={{ marginBottom: "4px" }}
                >
                  {getStatusLabel(newStatus)}
                </EuiButton>
              )
            )}
          </div>
        </EuiPopover>
      ),
    },
    {
      field: "priority",
      name: "Priority",
      sortable: true,
      width: "100px",
      render: (priority: Todo["priority"]) => (
        <EuiBadge color={getPriorityColor(priority)}>
          {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
        </EuiBadge>
      ),
    },
    {
      field: "tags",
      name: "Tags",
      render: (tags: string[]) => (
        <EuiFlexGroup gutterSize="xs" wrap>
          {tags?.map((tag) => (
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
      ),
    },
    {
      field: "createdAt",
      name: "Created",
      sortable: true,
      width: "150px",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      name: "Actions",
      width: "100px",
      actions: [
        {
          name: "Edit",
          description: "Edit this task",
          icon: "pencil",
          type: "icon",
          onClick: (todo: Todo) => onEdit?.(todo),
        },
        {
          name: "Delete",
          description: "Delete this task",
          icon: "trash",
          type: "icon",
          color: "danger",
          onClick: (todo: Todo) => onDelete?.(todo.id),
        },
      ],
    },
  ];

  const getStatusColor = (status: Todo["status"]) => {
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

  const getStatusLabel = (status: Todo["status"]) => {
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
  };

  const onTableChange = ({
    sort,
  }: {
    sort?: { field: string; direction: string };
  }) => {
    if (sort) {
      setSorting(sort);
    }
  };

  // Filter todos based on search query
  const filteredTodos = todos.filter((todo) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      todo.title.toLowerCase().includes(searchLower) ||
      todo.description.toLowerCase().includes(searchLower) ||
      todo.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  });

  const sortedTodos = [...filteredTodos].sort((a: any, b: any) => {
    const multiplier = sorting.direction === "asc" ? 1 : -1;
    return a[sorting.field] > b[sorting.field] ? multiplier : -multiplier;
  });

  return (
    <EuiBasicTable
      items={sortedTodos}
      columns={columns}
      sorting={{
        sort: {
          field: sorting.field,
          direction: sorting.direction,
        },
      }}
      onChange={onTableChange}
    />
  );
};

export default ListView;
