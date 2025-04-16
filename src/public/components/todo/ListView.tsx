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
} from "@elastic/eui";
import { Todo } from "./types";

interface ListViewProps {
  todos: Todo[];
  onStatusChange: (todoId: string, newStatus: Todo["status"]) => void;
}

const ListView: React.FC<ListViewProps> = ({ todos, onStatusChange }) => {
  const [sorting, setSorting] = useState({
    field: "createdAt",
    direction: "desc",
  });

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
            {description.length > 50
              ? `${description.substring(0, 50)}...`
              : description}
          </EuiText>
        </EuiToolTip>
      ),
    },
    {
      field: "status",
      name: "Status",
      sortable: true,
      render: (status: Todo["status"]) => (
        <EuiBadge color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </EuiBadge>
      ),
    },
    {
      field: "priority",
      name: "Priority",
      sortable: true,
      width: "100px",
      render: (priority: Todo["priority"]) => (
        <EuiBadge color={getPriorityColor(priority)}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </EuiBadge>
      ),
    },
    {
      field: "tags",
      name: "Tags",
      render: (tags: string[]) => (
        <EuiFlexGroup gutterSize="xs" wrap>
          {tags.map((tag) => (
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
          onClick: () => {},
        },
        {
          name: "Delete",
          description: "Delete this task",
          icon: "trash",
          type: "icon",
          color: "danger",
          onClick: () => {},
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

  const sortedTodos = [...todos].sort((a: any, b: any) => {
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
