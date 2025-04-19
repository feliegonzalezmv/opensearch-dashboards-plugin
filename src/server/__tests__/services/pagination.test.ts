import { TodoService } from "../../services/todoService";

describe("TodoService - Pagination", () => {
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
  };

  let todoService: TodoService;

  beforeEach(() => {
    jest.clearAllMocks();
    todoService = new TodoService(mockClient);
  });

  describe("getAllTodos", () => {
    it("should get all todos", async () => {
      // Mock response with 15 todos
      const mockTodos = Array.from({ length: 15 }, (_, i) => ({
        _id: `todo-${i + 1}`,
        _source: {
          title: `Title ${i + 1}`,
          description: `Description ${i + 1}`,
          status: "to_do",
          priority: "medium",
          tags: ["tag1", "tag2"],
          createdAt: new Date().toISOString(),
        },
      }));

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: mockTodos,
          },
        },
      });

      const result = await todoService.getAllTodos();

      expect(mockClient.search).toHaveBeenCalledWith({
        index: "todos",
        body: {
          sort: [{ createdAt: { order: "desc" } }],
        },
      });

      expect(result.length).toBe(15);
      expect(result[0].id).toBe("todo-1");
    });

    it("should return empty array when no todos found", async () => {
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
          },
        },
      });

      const result = await todoService.getAllTodos();

      expect(result).toEqual([]);
    });
  });
});
