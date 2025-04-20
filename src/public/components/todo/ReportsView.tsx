import React from "react";
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
  EuiSpacer,
  EuiStat,
  EuiIcon,
  EuiHorizontalRule,
  EuiCodeBlock,
} from "@elastic/eui";
import { Todo } from "./types";

// Simple chart component to simulate a bar chart
const BarChart: React.FC<{
  data: { label: string; count: number; color: string }[];
}> = ({ data }) => {
  const maxValue = Math.max(...data.map((item) => item.count));

  return (
    <div
      style={{
        width: "100%",
        height: "200px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-around",
      }}
    >
      {data.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "60px",
          }}
        >
          <div
            style={{
              height: `${(item.count / maxValue) * 180}px`,
              width: "40px",
              backgroundColor: item.color,
              borderRadius: "4px 4px 0 0",
              marginBottom: "5px",
              minHeight: "10px",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div>{item.label}</div>
            <div>
              <strong>{item.count}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple chart component to simulate a donut chart
const DonutChart: React.FC<{
  data: { label: string; count: number; color: string }[];
}> = ({ data }) => {
  // Calculate percentages
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const dataWithPercent = data.map((item) => ({
    ...item,
    percent: Math.round((item.count / total) * 100),
  }));

  return (
    <div style={{ width: "100%", padding: "20px", textAlign: "center" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {dataWithPercent.map((item, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "5px" }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: item.color,
                borderRadius: "2px",
              }}
            ></div>
            <span>
              {item.label}: {item.percent}%
            </span>
          </div>
        ))}
      </div>
      <EuiCodeBlock language="html" paddingSize="s">
        {dataWithPercent.map(
          (item) => `${item.label}: ${item.count} (${item.percent}%)\n`
        )}
      </EuiCodeBlock>
    </div>
  );
};

// Helper function to calculate statistics instead of using useMemo
const calculateStats = (todos: Todo[]) => {
  const totalTasks = todos.length;
  const completedTasks = todos.filter(
    (todo) => todo.status === "completed"
  ).length;
  const inProgressTasks = todos.filter(
    (todo) => todo.status === "in_progress"
  ).length;
  const plannedTasks = todos.filter((todo) => todo.status === "planned").length;
  const errorTasks = todos.filter((todo) => todo.status === "error").length;

  const highPriorityTasks = todos.filter(
    (todo) => todo.priority === "high"
  ).length;
  const mediumPriorityTasks = todos.filter(
    (todo) => todo.priority === "medium"
  ).length;
  const lowPriorityTasks = todos.filter(
    (todo) => todo.priority === "low"
  ).length;

  // Calculate completion rate
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get all unique tags and count occurrences
  const tagCounts: Record<string, number> = {};
  todos.forEach((todo) => {
    todo.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Get the top 5 most used tags
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    plannedTasks,
    errorTasks,
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,
    completionRate,
    topTags,
  };
};

interface ReportsViewProps {
  todos: Todo[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ todos }) => {
  // Calculate statistics based on todos - without using hooks
  const stats = calculateStats(todos);

  const statusChartData = [
    { label: "Planned", count: stats.plannedTasks, color: "#98A2B3" },
    { label: "In Progress", count: stats.inProgressTasks, color: "#3498DB" },
    { label: "Completed", count: stats.completedTasks, color: "#2ECC71" },
    { label: "Error", count: stats.errorTasks, color: "#E74C3C" },
  ];

  const priorityChartData = [
    { label: "High", count: stats.highPriorityTasks, color: "#E74C3C" },
    { label: "Medium", count: stats.mediumPriorityTasks, color: "#F39C12" },
    { label: "Low", count: stats.lowPriorityTasks, color: "#2ECC71" },
  ];

  return (
    <div>
      <EuiTitle size="s">
        <h2>Task Analytics Dashboard</h2>
      </EuiTitle>
      <EuiSpacer size="m" />

      {/* Key metrics */}
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiStat
            title={`${stats.totalTasks}`}
            description="Total Tasks"
            titleColor="primary"
            textAlign="center"
            icon={<EuiIcon type="listAdd" />}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat
            title={`${stats.completionRate}%`}
            description="Completion Rate"
            titleColor={
              stats.completionRate > 70
                ? "success"
                : stats.completionRate > 30
                ? "warning"
                : "danger"
            }
            textAlign="center"
            icon={
              <EuiIcon
                type="checkInCircleFilled"
                color={
                  stats.completionRate > 70
                    ? "success"
                    : stats.completionRate > 30
                    ? "warning"
                    : "danger"
                }
              />
            }
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat
            title={`${stats.highPriorityTasks}`}
            description="High Priority Tasks"
            titleColor="danger"
            textAlign="center"
            icon={<EuiIcon type="flag" color="danger" />}
          />
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="l" />
      <EuiHorizontalRule />
      <EuiSpacer size="m" />

      {/* Charts */}
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiPanel>
            <EuiTitle size="xs">
              <h3>Tasks by Status</h3>
            </EuiTitle>
            <EuiSpacer size="s" />
            <BarChart data={statusChartData} />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <EuiTitle size="xs">
              <h3>Tasks by Priority</h3>
            </EuiTitle>
            <EuiSpacer size="s" />
            <DonutChart data={priorityChartData} />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="l" />

      {/* Top tags section */}
      <EuiPanel>
        <EuiTitle size="xs">
          <h3>Top 5 Tags</h3>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiFlexGroup wrap>
          {stats.topTags.map((tag, index) => (
            <EuiFlexItem grow={false} key={index}>
              <EuiPanel color="subdued" hasShadow={false}>
                <EuiText>
                  <p>
                    <strong>{tag.tag}:</strong> {tag.count} tasks
                  </p>
                </EuiText>
              </EuiPanel>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiPanel>
    </div>
  );
};

// Export the helper function for testing
export { calculateStats };
export default ReportsView;
