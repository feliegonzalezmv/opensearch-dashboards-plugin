import * as todoApi from "../todoApi";
import { Todo } from "../../types";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock document.cookie para getXsrfToken
document.cookie = "osd-xsrf=test-xsrf-token";

describe("todoApi", () => {
  const mockTodo: Todo = {
    id: "1",
    title: "Test Todo",
    description: "Test Description",
    status: "planned",
    priority: "medium",
    tags: ["test"],
    createdAt: "2023-01-01T00:00:00.000Z",
  };

  const mockTodoInput = {
    title: "Test Todo",
    description: "Test Description",
    status: "planned" as const,
    priority: "medium" as const,
    tags: ["test"],
  };

  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTodo),
    });
  });

  describe("getAllTodos", () => {
    test("should fetch todos from the API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([mockTodo]),
      });

      const result = await todoApi.getAllTodos();

      expect(mockFetch).toHaveBeenCalledWith("/api/custom_plugin/todos", {
        headers: {
          "osd-xsrf": "test-xsrf-token",
        },
      });
      expect(result).toEqual([mockTodo]);
    });

    test("should throw an error if the request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(todoApi.getAllTodos()).rejects.toThrow(
        "Failed to fetch todos"
      );
    });
  });

  describe("getTodoById", () => {
    test("should fetch a todo by ID", async () => {
      const result = await todoApi.getTodoById("1");

      expect(mockFetch).toHaveBeenCalledWith("/api/custom_plugin/todos/1", {
        headers: {
          "osd-xsrf": "test-xsrf-token",
        },
      });
      expect(result).toEqual(mockTodo);
    });

    test("should throw an error if the request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(todoApi.getTodoById("1")).rejects.toThrow(
        "Failed to fetch todo with ID: 1"
      );
    });
  });

  describe("createTodo", () => {
    test("should create a new todo", async () => {
      const result = await todoApi.createTodo(mockTodoInput);

      expect(mockFetch).toHaveBeenCalledWith("/api/custom_plugin/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "osd-xsrf": "test-xsrf-token",
        },
        body: JSON.stringify(mockTodoInput),
      });
      expect(result).toEqual(mockTodo);
    });

    test("should throw an error if the request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: "Validation failed" }),
      });

      await expect(todoApi.createTodo(mockTodoInput)).rejects.toThrow(
        "Validation failed"
      );
    });
  });

  describe("updateTodo", () => {
    test("should update a todo", async () => {
      const updateData = { title: "Updated Title" };
      const result = await todoApi.updateTodo("1", updateData);

      expect(mockFetch).toHaveBeenCalledWith("/api/custom_plugin/todos/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "osd-xsrf": "test-xsrf-token",
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockTodo);
    });

    test("should throw an error if the request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      });

      await expect(
        todoApi.updateTodo("1", { title: "Updated Title" })
      ).rejects.toThrow("Failed to update todo with ID: 1");
    });
  });

  describe("deleteTodo", () => {
    test("should delete a todo", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await todoApi.deleteTodo("1");

      expect(mockFetch).toHaveBeenCalledWith("/api/custom_plugin/todos/1", {
        method: "DELETE",
        headers: {
          "osd-xsrf": "test-xsrf-token",
        },
      });
    });

    test("should throw an error if the request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      });

      await expect(todoApi.deleteTodo("1")).rejects.toThrow(
        "Failed to delete todo with ID: 1"
      );
    });
  });

  describe("searchTodos", () => {
    test("should search todos", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([mockTodo]),
      });

      const result = await todoApi.searchTodos("test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/custom_plugin/todos/search?q=test",
        {
          headers: {
            "osd-xsrf": "test-xsrf-token",
          },
        }
      );
      expect(result).toEqual([mockTodo]);
    });

    test("should throw an error if the request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(todoApi.searchTodos("test")).rejects.toThrow(
        "Failed to search todos"
      );
    });
  });
});
