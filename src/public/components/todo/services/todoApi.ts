import { Todo } from "../types";

// Base URL for the API
const API_BASE_URL = "/api/custom_plugin";

// Helper function to get XSRF token from cookie
const getXsrfToken = () => {
  const cookies = document.cookie.split(";");
  const xsrfCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("osd-xsrf=")
  );
  return xsrfCookie ? xsrfCookie.split("=")[1] : "";
};

// API functions grouped in an object for easier import
export const todoApi = {
  // Get all todos
  getAllTodos: async (): Promise<Todo[]> => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      headers: {
        "osd-xsrf": getXsrfToken(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch todos");
    }
    return response.json();
  },

  // Get a todo by ID
  getTodoById: async (id: string): Promise<Todo> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      headers: {
        "osd-xsrf": getXsrfToken(),
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch todo with ID: ${id}`);
    }
    return response.json();
  },

  // Create a new todo
  createTodo: async (todo: Omit<Todo, "id" | "createdAt">): Promise<Todo> => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "osd-xsrf": getXsrfToken(),
      },
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create todo");
    }
    return response.json();
  },

  // Update a todo
  updateTodo: async (
    id: string,
    todo: Partial<Omit<Todo, "id" | "createdAt">>
  ): Promise<Todo> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "osd-xsrf": getXsrfToken(),
      },
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update todo with ID: ${id}`);
    }
    return response.json();
  },

  // Delete a todo
  deleteTodo: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
      headers: {
        "osd-xsrf": getXsrfToken(),
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to delete todo with ID: ${id}`);
    }
  },

  // Search todos
  searchTodos: async (query: string): Promise<Todo[]> => {
    const response = await fetch(
      `${API_BASE_URL}/todos/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "osd-xsrf": getXsrfToken(),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to search todos");
    }
    return response.json();
  },
};
