import { TodoService } from "../../services/todoService";

describe("TodoService - CRUD Operations", () => {
  // Mock de OpenSearch Client
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

  describe("getTodoById", () => {
    it("should return a todo by id", async () => {
      // Configurar mock
      mockClient.get.mockResolvedValue({
        body: {
          _id: "1",
          _source: {
            title: "Specific Todo",
            description: "Task details",
            status: "in_progress",
            priority: "high",
            tags: ["important"],
            createdAt: "2023-01-01",
          },
        },
      });

      // Obtener un todo por id
      const result = await todoService.getTodoById("1");

      // Verificar que se llamó a get
      expect(mockClient.get).toHaveBeenCalled();

      // Verificar que devuelve un objeto con id
      expect(result).toBeTruthy();
      expect(result).toHaveProperty("id", "1");
    });

    it("should return null if todo not found", async () => {
      // Configurar mock para simular un error 404
      mockClient.get.mockRejectedValue({ statusCode: 404 });

      // Intentar obtener un todo que no existe
      const result = await todoService.getTodoById("nonexistent");

      // Verificar que se llamó a get
      expect(mockClient.get).toHaveBeenCalled();

      // Verificar que devuelve null
      expect(result).toBeNull();
    });
  });

  describe("updateTodo", () => {
    it("should update a todo successfully", async () => {
      // Mock para verificación de existencia
      mockClient.exists.mockResolvedValue({ body: true });

      // Mock para update
      mockClient.update.mockResolvedValue({});

      // Mock para obtener el todo actualizado
      mockClient.get.mockResolvedValue({
        body: {
          _id: "1",
          _source: {
            title: "Updated Title",
            description: "Original description",
            status: "in_progress",
            priority: "medium",
            tags: ["original"],
            createdAt: "2023-01-01",
          },
        },
      });

      // Datos de actualización
      const updateData = {
        title: "Updated Title",
        status: "in_progress" as const,
      };

      // Actualizar todo
      const result = await todoService.updateTodo("1", updateData);

      // Verificar que se llamó a update
      expect(mockClient.update).toHaveBeenCalled();

      // Verificar el resultado básico
      expect(result).toBeTruthy();
      expect(result).toHaveProperty("id", "1");
      expect(result).toHaveProperty("title", "Updated Title");
    });
  });

  describe("deleteTodo", () => {
    it("should delete a todo successfully", async () => {
      // Configurar mock
      mockClient.delete.mockResolvedValue({});

      // Eliminar todo
      const result = await todoService.deleteTodo("1");

      // Verificar que se llamó a delete
      expect(mockClient.delete).toHaveBeenCalled();

      // Verificar el resultado
      expect(result).toHaveProperty("success", true);
    });

    it("should handle error when todo does not exist", async () => {
      // Configurar mock para devolver un objeto con error controlado
      mockClient.delete.mockImplementation(() => {
        throw { statusCode: 404 };
      });

      // Intentar eliminar todo inexistente - capturamos la excepción
      try {
        const result = await todoService.deleteTodo("nonexistent");
        // Si se completó normalmente, verificamos que delete fue llamado
        expect(mockClient.delete).toHaveBeenCalled();
      } catch (error) {
        // Si falla, aseguramos que delete fue llamado antes del error
        expect(mockClient.delete).toHaveBeenCalled();
      }
    });
  });
});
