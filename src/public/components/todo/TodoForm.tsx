import React, { useState } from "react";
import {
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiTextArea,
  EuiSelect,
  EuiComboBox,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiPanel,
} from "@elastic/eui";
import { Todo } from "./types";

interface TodoFormProps {
  todo?: Todo;
  onSubmit: (todo: Omit<Todo, "id" | "createdAt">) => void;
  onCancel: () => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ todo, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(todo?.title || "");
  const [description, setDescription] = useState(todo?.description || "");
  const [status, setStatus] = useState<Todo["status"]>(
    todo?.status || "planned"
  );
  const [priority, setPriority] = useState<Todo["priority"]>(
    todo?.priority || "medium"
  );
  const [selectedTags, setSelectedTags] = useState<Array<{ label: string }>>(
    todo?.tags.map((tag) => ({ label: tag })) || []
  );

  const statusOptions = [
    { value: "planned", text: "Planned" },
    { value: "in_progress", text: "In Progress" },
    { value: "completed", text: "Completed" },
    { value: "error", text: "Error" },
  ];

  const priorityOptions = [
    { value: "low", text: "Low" },
    { value: "medium", text: "Medium" },
    { value: "high", text: "High" },
  ];

  const tagSuggestions = [
    { label: "security" },
    { label: "compliance" },
    { label: "audit" },
    { label: "pci-dss" },
    { label: "iso-27001" },
    { label: "sox" },
    { label: "critical" },
    { label: "maintenance" },
    { label: "update" },
    { label: "review" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      status,
      priority,
      tags: selectedTags.map((tag) => tag.label),
    });
  };

  const isValid = title.trim() !== "" && description.trim() !== "";

  return (
    <EuiPanel paddingSize="l" style={{ width: "100%" }}>
      <EuiForm
        component="form"
        onSubmit={handleSubmit}
        style={{ width: "100%" }}
      >
        <EuiFormRow
          label="Title"
          isRequired
          fullWidth
          style={{ maxWidth: "none" }}
        >
          <EuiFieldText
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            isInvalid={title.trim() === ""}
            fullWidth
            style={{ maxWidth: "none" }}
          />
        </EuiFormRow>

        <EuiFormRow
          label="Description"
          isRequired
          fullWidth
          style={{ maxWidth: "none" }}
        >
          <EuiTextArea
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            isInvalid={description.trim() === ""}
            fullWidth
            rows={8}
            style={{ maxWidth: "none", resize: "vertical", minHeight: "150px" }}
          />
        </EuiFormRow>

        <EuiSpacer size="m" />

        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFormRow label="Status" fullWidth>
              <EuiSelect
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value as Todo["status"])}
                fullWidth
                style={{ maxWidth: "none" }}
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiFormRow label="Priority" fullWidth>
              <EuiSelect
                options={priorityOptions}
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as Todo["priority"])
                }
                fullWidth
                style={{ maxWidth: "none" }}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="m" />

        <EuiFormRow label="Tags" fullWidth style={{ maxWidth: "none" }}>
          <EuiComboBox
            placeholder="Select or create tags"
            options={tagSuggestions}
            selectedOptions={selectedTags}
            onChange={setSelectedTags}
            isClearable={true}
            isInvalid={false}
            allowCustomOptions={true}
            fullWidth
            style={{ maxWidth: "none" }}
          />
        </EuiFormRow>

        <EuiSpacer size="l" />

        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton onClick={onCancel} color="danger">
              Cancel
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton type="submit" fill isDisabled={!isValid}>
              {todo ? "Save Changes" : "Create Task"}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
    </EuiPanel>
  );
};

export default TodoForm;
