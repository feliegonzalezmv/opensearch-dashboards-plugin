import { TodoService } from "../../services/todoService";

describe("TodoService - Search Functionality", () => {
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

  describe("Search todos by text", () => {
    it("should search todos by title with higher relevance", async () => {
      // Mock response with search results prioritizing title matches
      const mockTodos = [
        {
          _id: "todo-1",
          _source: {
            title: "Project Alpha Report",
            description: "Regular description",
            status: "to_do",
            priority: "medium",
            tags: ["report"],
            createdAt: new Date().toISOString(),
          },
        },
        {
          _id: "todo-2",
          _source: {
            title: "Regular title",
            description: "This contains Project Alpha details",
            status: "to_do",
            priority: "medium",
            tags: ["project-alpha"],
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

      const result = await todoService.searchTodos("Project Alpha");

      // Verify search was called with the right query
      expect(mockClient.search).toHaveBeenCalledWith({
        index: "todos",
        body: {
          query: {
            multi_match: {
              query: "Project Alpha",
              fields: ["title^2", "description", "tags"],
            },
          },
          sort: [{ createdAt: { order: "desc" } }],
        },
      });

      expect(result.length).toBe(2);
      // First result should be the title match due to boosting
      expect(result[0].title).toBe("Project Alpha Report");
    });

    it("should search todos by description", async () => {
      const mockTodos = [
        {
          _id: "todo-1",
          _source: {
            title: "Regular title",
            description: "Implement security features",
            status: "to_do",
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

      const result = await todoService.searchTodos("security");

      expect(mockClient.search).toHaveBeenCalledWith({
        index: "todos",
        body: {
          query: {
            multi_match: {
              query: "security",
              fields: ["title^2", "description", "tags"],
            },
          },
          sort: [{ createdAt: { order: "desc" } }],
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].description).toContain("security");
    });

    it("should search todos by tags", async () => {
      const mockTodos = [
        {
          _id: "todo-1",
          _source: {
            title: "Regular title",
            description: "Regular description",
            status: "to_do",
            priority: "medium",
            tags: ["urgent-fix"],
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

      const result = await todoService.searchTodos("urgent");

      expect(mockClient.search).toHaveBeenCalledWith({
        index: "todos",
        body: {
          query: {
            multi_match: {
              query: "urgent",
              fields: ["title^2", "description", "tags"],
            },
          },
          sort: [{ createdAt: { order: "desc" } }],
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].tags).toContain("urgent-fix");
    });

    it("should return empty array when no matches found", async () => {
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
          },
        },
      });

      const result = await todoService.searchTodos("nonexistent");

      expect(mockClient.search).toHaveBeenCalledWith({
        index: "todos",
        body: {
          query: {
            multi_match: {
              query: "nonexistent",
              fields: ["title^2", "description", "tags"],
            },
          },
          sort: [{ createdAt: { order: "desc" } }],
        },
      });

      expect(result.length).toBe(0);
    });
  });
});
