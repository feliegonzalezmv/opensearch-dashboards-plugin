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

interface TodoModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (todo: Omit<Todo, "id" | "createdAt">) => void;
  todo?: Todo;
}

const TodoModal: React.FC<TodoModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  todo,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <EuiOverlayMask>
      <EuiModal onClose={onClose} maxWidth={1000} style={{ minWidth: "800px" }}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            {todo ? "Edit Task" : "Create New Task"}
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <TodoForm todo={todo} onSubmit={onSubmit} onCancel={onClose} />
        </EuiModalBody>
      </EuiModal>
    </EuiOverlayMask>
  );
};

export default TodoModal;
