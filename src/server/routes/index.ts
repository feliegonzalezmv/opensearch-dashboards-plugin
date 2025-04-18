import { IRouter } from "@opensearch-dashboards/core/server";
import { schema } from "@osd/config-schema";
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

  // Debug endpoint to check index contents
  router.get(
    {
      path: "/api/custom_plugin/debug/index",
      validate: false,
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const result = await client.search({
          index: "todos",
          body: {
            query: {
              match_all: {},
            },
          },
        });
        return response.ok({ body: result.body });
      } catch (error) {
        console.error("Error checking index:", error);
        return response.internalError({
          body: {
            message: "Failed to check index",
            error: error.message,
          },
        });
      }
    }
  );

  // Get all todos
  router.get(
    {
      path: "/api/custom_plugin/todos",
      validate: false,
    },
    async (context, request, response) => {
      try {
        const todoService = new TodoService(
          context.core.opensearch.client.asCurrentUser
        );
        const todos = await todoService.getAllTodos();
        console.log("Retrieved todos:", todos);
        return response.ok({ body: todos });
      } catch (error) {
        console.error("Error fetching todos:", error);
        return response.internalError({
          body: {
            message: "Failed to fetch todos",
            error: error.message,
          },
        });
      }
    }
  );

  // Get a todo by ID
  router.get(
    {
      path: "/api/custom_plugin/todos/{id}",
      validate: {
        params: schema.object({
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
        body: schema.object({
          title: schema.string(),
          description: schema.string(),
          status: schema.oneOf([
            schema.literal("planned"),
            schema.literal("in_progress"),
            schema.literal("completed"),
            schema.literal("error"),
          ]),
          priority: schema.oneOf([
            schema.literal("low"),
            schema.literal("medium"),
            schema.literal("high"),
          ]),
          tags: schema.arrayOf(schema.string()),
        }),
      },
      options: {
        body: {
          maxBytes: 1024,
          accepts: ["application/json"],
        },
      },
    },
    async (context, request, response) => {
      try {
        console.log("Received request body:", request.body);

        const todoService = new TodoService(
          context.core.opensearch.client.asCurrentUser
        );

        const todo = await todoService.createTodo(request.body);
        console.log("Created todo:", todo);

        return response.ok({
          body: todo,
        });
      } catch (error) {
        console.error("Error creating todo:", error);
        return response.badRequest({
          body: {
            message:
              error instanceof Error ? error.message : "Failed to create todo",
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
        params: schema.object({
          id: schema.string(),
        }),
        body: schema.object({
          title: schema.maybe(schema.string()),
          description: schema.maybe(schema.string()),
          status: schema.maybe(
            schema.oneOf([
              schema.literal("planned"),
              schema.literal("in_progress"),
              schema.literal("completed"),
              schema.literal("error"),
            ])
          ),
          priority: schema.maybe(
            schema.oneOf([
              schema.literal("low"),
              schema.literal("medium"),
              schema.literal("high"),
            ])
          ),
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
        params: schema.object({
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
        query: schema.object({
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
