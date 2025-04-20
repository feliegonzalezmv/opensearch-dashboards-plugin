import { useState, useEffect, useCallback } from "react";
import { Todo, TodoStatus, TodoPriority } from "../types";
import { todoApi } from "../services/todoApi";

export interface TodosState {
  todos: Todo[];
  loading: boolean;
  error: Error | null;
  filteredTodos: Todo[];
  searchTerm: string;
  statusFilter: TodoStatus | "all";
  priorityFilter: TodoPriority | "all";
  tagFilter: string | "all";
}

export const useTodos = () => {
  const [state, setState] = useState<TodosState>({
    todos: [],
    loading: false,
    error: null,
    filteredTodos: [],
    searchTerm: "",
    statusFilter: "all",
    priorityFilter: "all",
    tagFilter: "all",
  });

  // Fetch todos from the API
  const fetchTodos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const fetchedTodos = await todoApi.getAllTodos();
      setState((prev) => ({
        ...prev,
        todos: fetchedTodos,
        filteredTodos: applyFilters(
          fetchedTodos,
          prev.searchTerm,
          prev.statusFilter,
          prev.priorityFilter,
          prev.tagFilter
        ),
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as Error, loading: false }));
      console.error("Error fetching todos:", error);
    }
  }, []);

  // Helper function to apply filters
  const applyFilters = (
    todos: Todo[],
    searchTerm: string,
    statusFilter: TodoStatus | "all",
    priorityFilter: TodoPriority | "all",
    tagFilter: string | "all"
  ) => {
    return todos.filter((todo) => {
      // Search term filter
      const matchesSearch =
        searchTerm === "" ||
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || todo.status === statusFilter;

      // Priority filter
      const matchesPriority =
        priorityFilter === "all" || todo.priority === priorityFilter;

      // Tag filter
      const matchesTag = tagFilter === "all" || todo.tags.includes(tagFilter);

      return matchesSearch && matchesStatus && matchesPriority && matchesTag;
    });
  };

  // Update filters and search
  const setSearchTerm = useCallback((searchTerm: string) => {
    setState((prev) => {
      const filteredTodos = applyFilters(
        prev.todos,
        searchTerm,
        prev.statusFilter,
        prev.priorityFilter,
        prev.tagFilter
      );
      return { ...prev, searchTerm, filteredTodos };
    });
  }, []);

  const setStatusFilter = useCallback((statusFilter: TodoStatus | "all") => {
    setState((prev) => {
      const filteredTodos = applyFilters(
        prev.todos,
        prev.searchTerm,
        statusFilter,
        prev.priorityFilter,
        prev.tagFilter
      );
      return { ...prev, statusFilter, filteredTodos };
    });
  }, []);

  const setPriorityFilter = useCallback(
    (priorityFilter: TodoPriority | "all") => {
      setState((prev) => {
        const filteredTodos = applyFilters(
          prev.todos,
          prev.searchTerm,
          prev.statusFilter,
          priorityFilter,
          prev.tagFilter
        );
        return { ...prev, priorityFilter, filteredTodos };
      });
    },
    []
  );

  const setTagFilter = useCallback((tagFilter: string | "all") => {
    setState((prev) => {
      const filteredTodos = applyFilters(
        prev.todos,
        prev.searchTerm,
        prev.statusFilter,
        prev.priorityFilter,
        tagFilter
      );
      return { ...prev, tagFilter, filteredTodos };
    });
  }, []);

  // CRUD operations
  const createTodo = useCallback(
    async (todo: Omit<Todo, "id" | "createdAt">) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const newTodo = await todoApi.createTodo(todo);
        setState((prev) => {
          const updatedTodos = [...prev.todos, newTodo];
          return {
            ...prev,
            todos: updatedTodos,
            filteredTodos: applyFilters(
              updatedTodos,
              prev.searchTerm,
              prev.statusFilter,
              prev.priorityFilter,
              prev.tagFilter
            ),
            loading: false,
          };
        });
        return newTodo;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
        console.error("Error creating todo:", error);
        throw error;
      }
    },
    []
  );

  const updateTodo = useCallback(
    async (id: string, todoData: Partial<Todo>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updatedTodo = await todoApi.updateTodo(id, todoData);
        setState((prev) => {
          const updatedTodos = prev.todos.map((todo) =>
            todo.id === id ? { ...todo, ...updatedTodo } : todo
          );
          return {
            ...prev,
            todos: updatedTodos,
            filteredTodos: applyFilters(
              updatedTodos,
              prev.searchTerm,
              prev.statusFilter,
              prev.priorityFilter,
              prev.tagFilter
            ),
            loading: false,
          };
        });
        return updatedTodo;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
        console.error("Error updating todo:", error);
        throw error;
      }
    },
    []
  );

  const deleteTodo = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await todoApi.deleteTodo(id);
      setState((prev) => {
        const updatedTodos = prev.todos.filter((todo) => todo.id !== id);
        return {
          ...prev,
          todos: updatedTodos,
          filteredTodos: applyFilters(
            updatedTodos,
            prev.searchTerm,
            prev.statusFilter,
            prev.priorityFilter,
            prev.tagFilter
          ),
          loading: false,
        };
      });
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as Error, loading: false }));
      console.error("Error deleting todo:", error);
      throw error;
    }
  }, []);

  // Status change specific handler for Kanban view
  const updateTodoStatus = useCallback(
    async (id: string, newStatus: TodoStatus) => {
      return updateTodo(id, { status: newStatus });
    },
    [updateTodo]
  );

  // Load todos on mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    ...state,
    fetchTodos,
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    setTagFilter,
    createTodo,
    updateTodo,
    deleteTodo,
    updateTodoStatus,
  };
};
