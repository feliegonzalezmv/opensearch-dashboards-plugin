export type ViewType = "list" | "kanban" | "reports";

export type TodoStatus = "planned" | "in_progress" | "completed" | "error";
export type TodoPriority = "low" | "medium" | "high";

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  tags: string[];
  createdAt: string;
}

// Form data for creating/editing a todo
export interface TodoFormData {
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  tags: string[];
}

// Global declarations for tests
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Mock<T = any, Y extends any[] = any[]> {
      (...args: Y): T;
      mockImplementation: (fn: (...args: Y) => T) => Mock<T, Y>;
      mockReturnValue: (val: T) => Mock<T, Y>;
      mockResolvedValue: (val: T) => Mock<T, Y>;
    }
    function fn<T = any, Y extends any[] = any[]>(): Mock<T, Y>;
    function fn<T = any, Y extends any[] = any[]>(
      implementation: (...args: Y) => T
    ): Mock<T, Y>;
    function mock(
      moduleName: string,
      factory?: any,
      options?: any
    ): typeof jest;
    function clearAllMocks(): typeof jest;
  }

  function describe(name: string, fn: () => void): void;
  function beforeEach(fn: () => void): void;
  function test(name: string, fn: () => void): void;
  function test(name: string, fn: (done: () => void) => void): void;
  function expect<T>(value: T): any;
}
