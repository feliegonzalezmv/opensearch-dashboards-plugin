import { OpenSearchClient } from "../types/core";

// Define the index name for todos
const TODO_INDEX = "todos";

// Define the Todo interface
export interface Todo {
  id: string;
  title: string;
  description: string;
  status: "planned" | "in_progress" | "completed" | "error";
  priority: "low" | "medium" | "high";
  tags: string[];
  createdAt: string;
}

export class TodoService {
  private client: OpenSearchClient;

  constructor(client: OpenSearchClient) {
    this.client = client;
  }

  // Initialize the index if it doesn't exist
  async initializeIndex() {
    const exists = await this.client.indices.exists({
      index: TODO_INDEX,
    });

    if (!exists.body) {
      await this.client.indices.create({
        index: TODO_INDEX,
        body: {
          mappings: {
            properties: {
              title: { type: "text" },
              description: { type: "text" },
              status: { type: "keyword" },
              priority: { type: "keyword" },
              tags: { type: "keyword" },
              createdAt: { type: "date" },
            },
          },
        },
      });
    }
  }

  // Get all todos
  async getAllTodos() {
    await this.initializeIndex();

    const response = await this.client.search({
      index: TODO_INDEX,
      body: {
        sort: [{ createdAt: { order: "desc" } }],
      },
    });

    return response.body.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
    }));
  }

  // Get a todo by ID
  async getTodoById(id: string) {
    try {
      const response = await this.client.get({
        index: TODO_INDEX,
        id,
      });

      return {
        id: response.body._id,
        ...response.body._source,
      };
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  // Create a new todo
  async createTodo(todoData: Omit<Todo, "id" | "createdAt">): Promise<Todo> {
    try {
      const document = {
        title: todoData.title,
        description: todoData.description,
        status: todoData.status,
        priority: todoData.priority,
        tags: todoData.tags,
        createdAt: new Date().toISOString(),
      };

      const response = await this.client.index({
        index: TODO_INDEX,
        body: document,
      });

      const createdTodo: Todo = {
        id: response.body._id,
        ...document,
      };

      return createdTodo;
    } catch (error) {
      throw error;
    }
  }

  // Update a todo
  async updateTodo(id: string, todo: Partial<Omit<Todo, "id" | "createdAt">>) {
    await this.initializeIndex();

    try {
      const exists = await this.client.exists({
        index: TODO_INDEX,
        id,
      });

      if (!exists.body) {
        throw { statusCode: 404, message: "Todo not found" };
      }

      await this.client.update({
        index: TODO_INDEX,
        id,
        body: {
          doc: todo,
        },
      });

      const updatedTodo = await this.getTodoById(id);

      return updatedTodo;
    } catch (error) {
      console.error("Error in updateTodo:", error);
      throw error;
    }
  }

  // Delete a todo
  async deleteTodo(id: string) {
    await this.initializeIndex();

    await this.client.delete({
      index: TODO_INDEX,
      id,
    });

    return { success: true };
  }

  // Search todos
  async searchTodos(query: string) {
    await this.initializeIndex();

    const response = await this.client.search({
      index: TODO_INDEX,
      body: {
        query: {
          multi_match: {
            query,
            fields: ["title^2", "description", "tags"],
          },
        },
        sort: [{ createdAt: { order: "desc" } }],
      },
    });

    return response.body.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
    }));
  }
}
