import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Todo } from "../types";
import ReportsView, { calculateStats } from "../ReportsView";

// Mock @elastic/eui components to avoid issues with hooks
jest.mock("@elastic/eui", () => ({
  EuiPanel: ({ children }) => <div data-testid="eui-panel">{children}</div>,
  EuiFlexGroup: ({ children }) => (
    <div data-testid="eui-flex-group">{children}</div>
  ),
  EuiFlexItem: ({ children }) => (
    <div data-testid="eui-flex-item">{children}</div>
  ),
  EuiTitle: ({ children }) => <div data-testid="eui-title">{children}</div>,
  EuiText: ({ children }) => <div data-testid="eui-text">{children}</div>,
  EuiSpacer: () => <div data-testid="eui-spacer" />,
  EuiStat: ({ title, description }) => (
    <div data-testid="eui-stat">
      <div data-testid="eui-stat-title">{title}</div>
      <div data-testid="eui-stat-description">{description}</div>
    </div>
  ),
  EuiIcon: () => <div data-testid="eui-icon" />,
  EuiHorizontalRule: () => <div data-testid="eui-horizontal-rule" />,
  EuiCodeBlock: ({ children }) => (
    <div data-testid="eui-code-block">{children}</div>
  ),
}));

describe("ReportsView", () => {
  const mockTodos: Todo[] = [
    {
      id: "1",
      title: "Task 1",
      description: "Description 1",
      status: "planned",
      priority: "high",
      tags: ["security", "compliance"],
      createdAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      title: "Task 2",
      description: "Description 2",
      status: "in_progress",
      priority: "medium",
      tags: ["security"],
      createdAt: "2023-01-02T00:00:00.000Z",
    },
    {
      id: "3",
      title: "Task 3",
      description: "Description 3",
      status: "completed",
      priority: "low",
      tags: ["audit"],
      createdAt: "2023-01-03T00:00:00.000Z",
    },
  ];

  test("calculates statistics correctly", () => {
    const stats = calculateStats(mockTodos);

    expect(stats.totalTasks).toBe(3);
    expect(stats.completedTasks).toBe(1);
    expect(stats.inProgressTasks).toBe(1);
    expect(stats.plannedTasks).toBe(1);
    expect(stats.errorTasks).toBe(0);
    expect(stats.highPriorityTasks).toBe(1);
    expect(stats.mediumPriorityTasks).toBe(1);
    expect(stats.lowPriorityTasks).toBe(1);
    expect(stats.completionRate).toBe(33);
    expect(stats.topTags.length).toBe(3);
    expect(stats.topTags.some((tag) => tag.tag === "security")).toBe(true);
  });

  test("renders the reports dashboard with correct title", () => {
    render(<ReportsView todos={mockTodos} />);

    // Check that the title is rendered
    expect(screen.getByText("Task Analytics Dashboard")).toBeInTheDocument();
  });

  test("displays correct task count statistics", () => {
    render(<ReportsView todos={mockTodos} />);

    // Check that the total tasks count is displayed
    const statTitles = screen.getAllByTestId("eui-stat-title");
    const totalTasksTitle = statTitles.find(
      (element) => element.textContent === "3"
    );
    expect(totalTasksTitle).toBeInTheDocument();

    // Check that the completion rate is displayed
    const completionRate = statTitles.find(
      (element) => element.textContent === "33%"
    );
    expect(completionRate).toBeInTheDocument();

    // Check that high priority tasks count is displayed
    const highPriorityCount = statTitles.find(
      (element) => element.textContent === "1"
    );
    expect(highPriorityCount).toBeInTheDocument();
  });

  test("renders status and priority charts", () => {
    render(<ReportsView todos={mockTodos} />);

    // Check that the charts section titles are present
    expect(screen.getByText("Tasks by Status")).toBeInTheDocument();
    expect(screen.getByText("Tasks by Priority")).toBeInTheDocument();
  });

  test("displays top tags section", () => {
    render(<ReportsView todos={mockTodos} />);

    // Check that the top tags section is present
    expect(screen.getByText("Top 5 Tags")).toBeInTheDocument();

    // Security tag should be present as it's used in multiple tasks
    expect(screen.getByText(/security:/i)).toBeInTheDocument();
  });
});
