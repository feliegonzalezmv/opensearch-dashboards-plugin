import { TodoService } from "../../services/todoService";

describe("TodoService - Search", () => {
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

  describe("searchTodos", () => {
    it("should search todos by query", async () => {
      // Configurar mock de resultados
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [
              {
                _id: "1",
                _source: {
                  title: "Security Todo",
                  description: "Implement security controls",
                  status: "in_progress",
                  priority: "high",
                  tags: ["security", "compliance"],
                  createdAt: "2023-01-01",
                },
              },
              {
                _id: "2",
                _source: {
                  title: "Database Access",
                  description: "Review security permissions",
                  status: "planned",
                  priority: "medium",
                  tags: ["database", "security"],
                  createdAt: "2023-01-02",
                },
              },
            ],
          },
        },
      });

      // Realizar la búsqueda
      const result = await todoService.searchTodos("security");

      // Verificar que se llamó al método search
      expect(mockClient.search).toHaveBeenCalled();

      // Verificar que se obtuvieron resultados
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("id", "1");
      expect(result[1]).toHaveProperty("id", "2");
    });

    it("should return empty array when no results", async () => {
      // Configurar el mock para que devuelva sin resultados
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
          },
        },
      });

      // Realizar la búsqueda
      const result = await todoService.searchTodos("nonexistent");

      // Verificar la llamada al método search
      expect(mockClient.search).toHaveBeenCalled();

      // Verificar que devuelve un array vacío
      expect(result).toEqual([]);
    });
  });
});
