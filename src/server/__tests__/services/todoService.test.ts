import { TodoService } from "../../services/todoService";

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
  exists: jest.fn(),
};

// Configuración global para todos los tests
beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoService", () => {
  let todoService: TodoService;

  beforeEach(() => {
    todoService = new TodoService(mockClient);
  });

  describe("getAllTodos", () => {
    it("should return all todos", async () => {
      // Configurar el mock
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [
              {
                _id: "1",
                _source: {
                  title: "Test Todo",
                  description: "Test Description",
                  status: "planned",
                  priority: "high",
                  tags: ["test"],
                  createdAt: "2023-01-01",
                },
              },
            ],
          },
        },
      });

      // Llamar al método
      const result = await todoService.getAllTodos();

      // Verificar que se llamó a search
      expect(mockClient.search).toHaveBeenCalled();

      // Verificar el resultado básico
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("createTodo", () => {
    it("should create a new todo", async () => {
      // Configurar el mock
      mockClient.index.mockResolvedValue({
        body: {
          _id: "1",
        },
      });

      // Datos del nuevo todo
      const todoData = {
        title: "New Todo",
        description: "New Description",
        status: "planned" as const,
        priority: "medium" as const,
        tags: ["new"],
      };

      // Llamar al método
      const result = await todoService.createTodo(todoData);

      // Verificar que se llamó a index
      expect(mockClient.index).toHaveBeenCalled();

      // Verificar que hay un id en el resultado
      expect(result).toHaveProperty("id");
      expect(result.title).toBe("New Todo");
    });
  });
});
