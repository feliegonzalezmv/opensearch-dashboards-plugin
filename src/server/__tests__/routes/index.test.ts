import { defineRoutes } from "../../routes";
import { TodoService } from "../../services/todoService";

// Mock del TodoService
jest.mock("../../services/todoService");

describe("Routes", () => {
  let router: any;
  let mockTodoService: any;

  beforeEach(() => {
    // Crear mocks
    router = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    // Mock del servicio
    mockTodoService = {
      getAllTodos: jest.fn(),
      getTodoById: jest.fn(),
      createTodo: jest.fn(),
      updateTodo: jest.fn(),
      deleteTodo: jest.fn(),
      searchTodos: jest.fn(),
    };

    // Registrar las rutas con nuestro router mock
    defineRoutes(router, mockTodoService);
  });

  it("should register GET /api/custom_plugin/todos route", () => {
    // Verificar que la ruta se registró
    expect(router.get).toHaveBeenCalled();

    // Verificar al menos una llamada a router.get que incluya la ruta de todos
    const getTodosCall = router.get.mock.calls.find(
      (call: any) => call[0].path === "/api/custom_plugin/todos"
    );
    expect(getTodosCall).toBeTruthy();
  });

  it("should register POST /api/custom_plugin/todos route", () => {
    // Verificar que la ruta se registró
    expect(router.post).toHaveBeenCalled();

    // Verificar al menos una llamada a router.post que incluya la ruta de todos
    const createTodoCall = router.post.mock.calls.find(
      (call: any) => call[0].path === "/api/custom_plugin/todos"
    );
    expect(createTodoCall).toBeTruthy();
  });

  it("should register PUT /api/custom_plugin/todos/{id} route", () => {
    // Verificar que la ruta se registró
    expect(router.put).toHaveBeenCalled();

    // Verificar al menos una llamada a router.put que incluya la ruta de todos
    const updateTodoCall = router.put.mock.calls.find(
      (call: any) => call[0].path === "/api/custom_plugin/todos/{id}"
    );
    expect(updateTodoCall).toBeTruthy();
  });

  it("should register DELETE /api/custom_plugin/todos/{id} route", () => {
    // Verificar que la ruta se registró
    expect(router.delete).toHaveBeenCalled();

    // Verificar al menos una llamada a router.delete que incluya la ruta de todos
    const deleteTodoCall = router.delete.mock.calls.find(
      (call: any) => call[0].path === "/api/custom_plugin/todos/{id}"
    );
    expect(deleteTodoCall).toBeTruthy();
  });
});
