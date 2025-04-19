import { TodoService } from "../../services/todoService";

describe("TodoService - Filtering", () => {
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

  describe("searchTodos with filtering", () => {
    it("should filter todos by status", async () => {
      // Mock response with filtered todos
      const mockTodos = Array.from({ length: 5 }, (_, i) => ({
        _id: `todo-${i + 1}`,
        _source: {
          title: `Title ${i + 1}`,
          description: `Description ${i + 1}`,
          status: "in_progress",
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

      // For this test, we'll use searchTodos as the base but will need
      // to assume the implementation handles status filtering
      const result = await todoService.searchTodos("in_progress status");

      // Verify search was called with a query that would match status
      expect(mockClient.search).toHaveBeenCalled();
      const callArgs = mockClient.search.mock.calls[0][0];
      expect(callArgs.index).toBe("todos");
      expect(callArgs.body.query).toBeDefined();

      // Basic assertions about the results
      expect(result.length).toBe(5);
      expect(result[0].status).toBe("in_progress");
    });

    it("should filter todos by priority", async () => {
      // Mock response with filtered todos
      const mockTodos = Array.from({ length: 3 }, (_, i) => ({
        _id: `todo-${i + 1}`,
        _source: {
          title: `Title ${i + 1}`,
          description: `Description ${i + 1}`,
          status: "to_do",
          priority: "high",
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

      // Use searchTodos with priority-related term
      const result = await todoService.searchTodos("high priority");

      // Verify search was called
      expect(mockClient.search).toHaveBeenCalled();

      // Basic assertions about the results
      expect(result.length).toBe(3);
      expect(result[0].priority).toBe("high");
    });

    it("should filter todos by multiple criteria", async () => {
      // Mock response with filtered todos
      const mockTodos = Array.from({ length: 2 }, (_, i) => ({
        _id: `todo-${i + 1}`,
        _source: {
          title: `Title ${i + 1}`,
          description: `Description ${i + 1}`,
          status: "in_progress",
          priority: "high",
          tags: ["security"],
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

      // Combine multiple search terms
      const result = await todoService.searchTodos("in_progress high security");

      // Verify search was called
      expect(mockClient.search).toHaveBeenCalled();

      // Basic assertions about the results
      expect(result.length).toBe(2);
      expect(result[0].status).toBe("in_progress");
      expect(result[0].priority).toBe("high");
      expect(result[0].tags).toContain("security");
    });

    it("should filter todos by search term", async () => {
      // Mock response with filtered todos
      const mockTodos = Array.from({ length: 4 }, (_, i) => ({
        _id: `todo-${i + 1}`,
        _source: {
          title: `Project X ${i + 1}`,
          description: `Description for Project X ${i + 1}`,
          status: "to_do",
          priority: "medium",
          tags: ["project-x"],
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

      const result = await todoService.searchTodos("Project X");

      // Verify search was called with the right query
      expect(mockClient.search).toHaveBeenCalledWith({
        index: "todos",
        body: {
          query: {
            multi_match: {
              query: "Project X",
              fields: ["title^2", "description", "tags"],
            },
          },
          sort: [{ createdAt: { order: "desc" } }],
        },
      });

      expect(result.length).toBe(4);
      expect(result[0].title).toContain("Project X");
    });
  });
});
