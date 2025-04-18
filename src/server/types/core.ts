// Core server types
export interface IRouter {
  get: (options: any, handler: any) => void;
  post: (options: any, handler: any) => void;
  put: (options: any, handler: any) => void;
  delete: (options: any, handler: any) => void;
}

export interface OpenSearchClient {
  index: (params: any) => Promise<any>;
  search: (params: any) => Promise<any>;
  get: (params: any) => Promise<any>;
  update: (params: any) => Promise<any>;
  delete: (params: any) => Promise<any>;
  indices: {
    exists: (params: any) => Promise<any>;
    create: (params: any) => Promise<any>;
  };
}

// Schema validation
export const schema = {
  object: (props: any) => props,
  string: () => ({ type: "string" }),
  oneOf: (values: any[]) => ({ type: "string", enum: values }),
  arrayOf: (itemSchema: any) => ({ type: "array", items: itemSchema }),
  maybe: (schema: any) => ({ ...schema, optional: true }),
  literal: (value: string) => ({ type: "string", enum: [value] }),
};
