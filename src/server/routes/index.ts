import { IRouter } from "@opensearch-dashboards/core/server";
import { TodoService } from "../services/todoService";

// Define the schema types manually
interface TodoSchema {
  title: string;
  description: string;
  status: "planned" | "in_progress" | "completed" | "error";
  priority: "low" | "medium" | "high";
  tags: string[];
}

export function defineRoutes(router: IRouter) {
  // Example route
  router.get(
    {
      path: "/api/custom_plugin/example",
      validate: false,
    },
    async (context, request, response) => {
      return response.ok({
        body: {
          time: new Date().toISOString(),
        },
      });
    }
  );

  // Get all todos
  router.get(
    {
      path: "/api/custom_plugin/todos",
      validate: false,
    },
    async (context, request, response) => {
      const todoService = new TodoService(
        context.core.opensearch.client.asCurrentUser
      );
      const todos = await todoService.getAllTodos();
      return response.ok({ body: todos });
    }
  );

  // Get a todo by ID
  router.get(
    {
      path: "/api/custom_plugin/todos/{id}",
      validate: {
        params: (schema) =>
          schema.object({
            id: schema.string(),
          }),
      },
    },
    async (context, request, response) => {
      const { id } = request.params;
      const todoService = new TodoService(
        context.core.opensearch.client.asCurrentUser
      );
      const todo = await todoService.getTodoById(id);

      if (!todo) {
        return response.notFound();
      }

      return response.ok({ body: todo });
    }
  );

  // Create a new todo
  router.post(
    {
      path: "/api/custom_plugin/todos",
      validate: {
        body: (schema) => {
          console.log("Schema object:", schema);
          return {
            title: { type: "string" },
            description: { type: "string" },
            status: {
              type: "string",
              enum: ["planned", "in_progress", "completed", "error"],
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
            },
            tags: {
              type: "array",
              items: { type: "string" },
            },
          };
        },
      },
      options: {
        xsrfRequired: true,
      },
    },
    async (context, request, response) => {
      try {
        const todoService = new TodoService(
          context.core.opensearch.client.asCurrentUser
        );
        const todo = await todoService.createTodo({
          ...request.body,
          createdAt: new Date().toISOString(),
        });
        return response.ok({ body: todo });
      } catch (error) {
        console.error("Error creating todo:", error);
        return response.internalError({
          body: {
            message: "Failed to create todo",
            error: error.message,
          },
        });
      }
    }
  );

  // Update a todo
  router.put(
    {
      path: "/api/custom_plugin/todos/{id}",
      validate: {
        params: (schema) =>
          schema.object({
            id: schema.string(),
          }),
        body: (schema) =>
          schema.object({
            title: schema.maybe(schema.string()),
            description: schema.maybe(schema.string()),
            status: schema.maybe(schema.string()),
            priority: schema.maybe(schema.string()),
            tags: schema.maybe(schema.arrayOf(schema.string())),
          }),
      },
    },
    async (context, request, response) => {
      const { id } = request.params;
      const todoService = new TodoService(
        context.core.opensearch.client.asCurrentUser
      );

      try {
        const todo = await todoService.updateTodo(id, request.body);
        return response.ok({ body: todo });
      } catch (error) {
        if (error.statusCode === 404) {
          return response.notFound();
        }
        console.error("Error updating todo:", error);
        return response.internalError({
          body: {
            message: "Failed to update todo",
            error: error.message,
          },
        });
      }
    }
  );

  // Delete a todo
  router.delete(
    {
      path: "/api/custom_plugin/todos/{id}",
      validate: {
        params: (schema) =>
          schema.object({
            id: schema.string(),
          }),
      },
    },
    async (context, request, response) => {
      const { id } = request.params;
      const todoService = new TodoService(
        context.core.opensearch.client.asCurrentUser
      );

      try {
        await todoService.deleteTodo(id);
        return response.ok({ body: { success: true } });
      } catch (error) {
        if (error.statusCode === 404) {
          return response.notFound();
        }
        console.error("Error deleting todo:", error);
        return response.internalError({
          body: {
            message: "Failed to delete todo",
            error: error.message,
          },
        });
      }
    }
  );

  // Search todos
  router.get(
    {
      path: "/api/custom_plugin/todos/search",
      validate: {
        query: (schema) =>
          schema.object({
            q: schema.string(),
          }),
      },
    },
    async (context, request, response) => {
      const { q } = request.query;
      const todoService = new TodoService(
        context.core.opensearch.client.asCurrentUser
      );
      const todos = await todoService.searchTodos(q);
      return response.ok({ body: todos });
    }
  );
}
