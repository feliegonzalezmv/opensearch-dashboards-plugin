import React from "react";
import {
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiOverlayMask,
} from "@elastic/eui";
import TodoForm from "./TodoForm";
import { Todo } from "./types";

export interface TodoModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (todo: Omit<Todo, "id" | "createdAt">) => void;
  initialTodo?: Todo;
}

const TodoModal: React.FC<TodoModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialTodo,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <EuiOverlayMask>
      <EuiModal onClose={onClose} maxWidth={1000} style={{ minWidth: "800px" }}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            {initialTodo ? "Edit Task" : "Create New Task"}
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <TodoForm todo={initialTodo} onSubmit={onSave} onCancel={onClose} />
        </EuiModalBody>
      </EuiModal>
    </EuiOverlayMask>
  );
};

export default TodoModal;
