import { TodoService } from "../../services/todoService";

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
  exists: jest.fn(),
};

// Global test setup
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

      const result = await todoService.getAllTodos();

      expect(mockClient.search).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("createTodo", () => {
    it("should create a new todo", async () => {
      mockClient.index.mockResolvedValue({
        body: {
          _id: "1",
        },
      });

      const todoData = {
        title: "New Todo",
        description: "New Description",
        status: "planned" as const,
        priority: "medium" as const,
        tags: ["new"],
      };

      const result = await todoService.createTodo(todoData);

      expect(mockClient.index).toHaveBeenCalled();
      expect(result).toHaveProperty("id");
      expect(result.title).toBe("New Todo");
    });
  });
});
