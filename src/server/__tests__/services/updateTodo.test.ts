import { TodoService } from "../../services/todoService";

describe("TodoService - Update Todo", () => {
  // Mock OpenSearch Client
  const mockClient = {
    indices: {
      exists: jest.fn().mockResolvedValue({ body: false }),
      create: jest.fn().mockResolvedValue({}),
    },
    search: jest.fn(),
    get: jest.fn(),
    index: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn().mockResolvedValue({ body: true }),
  };

  let todoService: TodoService;

  beforeEach(() => {
    jest.clearAllMocks();
    todoService = new TodoService(mockClient);
  });

  describe("updateTodo", () => {
    it("should update a todo successfully", async () => {
      const todoId = "test-id";
      const todoData = {
        title: "Updated Title",
        description: "Updated Description",
        status: "in_progress" as const,
        priority: "high" as const,
        tags: ["security", "feature"],
      };

      mockClient.update.mockResolvedValue({
        body: {
          _id: todoId,
          result: "updated",
        },
      });

      mockClient.get.mockResolvedValue({
        body: {
          _id: todoId,
          _source: {
            ...todoData,
            createdAt: "2023-01-01T00:00:00Z",
          },
        },
      });

      const result = await todoService.updateTodo(todoId, todoData);

      expect(mockClient.update).toHaveBeenCalledWith({
        index: "todos",
        id: todoId,
        body: {
          doc: todoData,
        },
      });

      expect(mockClient.get).toHaveBeenCalledWith({
        index: "todos",
        id: todoId,
      });

      expect(result).toEqual({
        id: todoId,
        ...todoData,
        createdAt: "2023-01-01T00:00:00Z",
      });
    });

    it("should handle errors if the todo does not exist", async () => {
      const todoId = "nonexistent-id";

      // Configurar el mock para simular que el todo no existe
      mockClient.exists.mockResolvedValue({ body: false });

      try {
        await todoService.updateTodo(todoId, {
          title: "Updated Title",
          description: "Updated Description",
          status: "in_progress" as const,
          priority: "high" as const,
          tags: ["security"],
        });
        // Si no hay error, el test debería fallar
        expect(true).toBe(false); // Este código no debería ejecutarse
      } catch (error) {
        // Verificar que el error es el esperado
        expect(error).toHaveProperty("statusCode", 404);
        expect(error).toHaveProperty("message", "Todo not found");
      }

      expect(mockClient.update).not.toHaveBeenCalled();
    });

    it("should handle errors if update fails", async () => {
      const todoId = "test-id";
      const error = new Error("Update failed");

      mockClient.exists.mockResolvedValue({ body: true });
      mockClient.update.mockRejectedValue(error);

      try {
        await todoService.updateTodo(todoId, {
          title: "Updated Title",
          description: "Updated Description",
          status: "in_progress" as const,
          priority: "high" as const,
          tags: ["security"],
        });
        // Si no hay error, el test debería fallar
        expect(true).toBe(false); // Este código no debería ejecutarse
      } catch (err) {
        // Verificar que el error es el esperado
        expect(err).toBe(error);
      }
    });
  });
});
