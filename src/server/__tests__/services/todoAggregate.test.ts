import { TodoService } from "../../services/todoService";

describe("TodoService - Aggregations", () => {
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

  describe("searchTodos for aggregations", () => {
    it("should search todos by status", async () => {
      const mockTodos = [
        {
          _id: "todo-1",
          _source: {
            title: "Todo 1",
            description: "Description 1",
            status: "planned",
            priority: "medium",
            tags: ["security"],
            createdAt: new Date().toISOString(),
          },
        },
        {
          _id: "todo-2",
          _source: {
            title: "Todo 2",
            description: "Description 2",
            status: "in_progress",
            priority: "high",
            tags: ["feature"],
            createdAt: new Date().toISOString(),
          },
        },
      ];

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: mockTodos,
          },
        },
      });

      const result = await todoService.searchTodos("status:planned");

      expect(mockClient.search).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no todos match search", async () => {
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
          },
        },
      });

      const result = await todoService.searchTodos("nonexistent");

      expect(mockClient.search).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
