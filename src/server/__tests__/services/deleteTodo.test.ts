import { TodoService } from "../../services/todoService";

describe("TodoService - Delete Todo", () => {
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

  describe("deleteTodo", () => {
    it("should delete a todo successfully", async () => {
      const todoId = "test-id";

      mockClient.delete.mockResolvedValue({
        body: {
          _id: todoId,
          result: "deleted",
        },
      });

      await todoService.deleteTodo(todoId);

      expect(mockClient.delete).toHaveBeenCalledWith({
        index: "todos",
        id: todoId,
      });
    });

    it("should still succeed even if todo does not exist", async () => {
      // En la implementación actual, no se verifica si el todo existe
      // antes de intentar eliminarlo, simplemente se llama a delete
      const todoId = "nonexistent-id";

      // Configuramos el mock de exists para simular que el todo no existe
      mockClient.exists.mockResolvedValue({ body: false });

      // Y configuramos delete para que no lance errores
      mockClient.delete.mockResolvedValue({
        body: {
          _id: todoId,
          result: "deleted",
        },
      });

      const result = await todoService.deleteTodo(todoId);
      expect(result).toEqual({ success: true });
      expect(mockClient.delete).toHaveBeenCalled();
    });

    it("should handle delete operation failures", async () => {
      const todoId = "test-id";
      const error = new Error("Delete failed");

      mockClient.delete.mockRejectedValue(error);

      try {
        await todoService.deleteTodo(todoId);
        // Si no hay error, el test debería fallar
        expect(true).toBe(false); // Este código no debería ejecutarse
      } catch (err) {
        // Verificar que el error es el esperado
        expect(err).toBe(error);
      }
    });
  });
});
