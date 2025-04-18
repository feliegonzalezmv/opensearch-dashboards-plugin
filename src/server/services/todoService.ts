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
      console.log("Creating todo with data:", todoData);

      const document = {
        title: todoData.title,
        description: todoData.description,
        status: todoData.status,
        priority: todoData.priority,
        tags: todoData.tags,
        createdAt: new Date().toISOString(),
      };

      console.log("Document to index:", document);

      const response = await this.client.index({
        index: TODO_INDEX,
        body: document,
      });

      console.log("OpenSearch response:", response);

      const createdTodo: Todo = {
        id: response.body._id,
        ...document,
      };

      console.log("Created todo object:", createdTodo);

      return createdTodo;
    } catch (error) {
      console.error("Error in createTodo:", error);
      throw error;
    }
  }

  // Update a todo
  async updateTodo(id: string, todo: Partial<Omit<Todo, "id" | "createdAt">>) {
    await this.initializeIndex();

    await this.client.update({
      index: TODO_INDEX,
      id,
      body: {
        doc: todo,
      },
    });

    return this.getTodoById(id);
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
