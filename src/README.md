# Todo Application for OpenSearch Dashboards

This is a plugin for OpenSearch Dashboards that provides a task management application for security compliance professionals.

## Features

- Create, read, update, and delete tasks
- Search tasks by title, description, or tags
- View tasks in list or kanban format
- Track task status (planned, in progress, completed, error)
- Assign priority levels to tasks
- Tag tasks for better organization

## Architecture

The application is built as a plugin for OpenSearch Dashboards with the following components:

### Frontend

- React-based UI using OpenSearch UI components
- List and Kanban views for task visualization
- Search functionality
- Task creation and editing forms

### Backend

- REST API endpoints for CRUD operations
- OpenSearch integration for data persistence
- Search functionality using OpenSearch's search capabilities

## API Endpoints

The following API endpoints are available:

- `GET /api/custom_plugin/todos` - Get all tasks
- `GET /api/custom_plugin/todos/{id}` - Get a task by ID
- `POST /api/custom_plugin/todos` - Create a new task
- `PUT /api/custom_plugin/todos/{id}` - Update a task
- `DELETE /api/custom_plugin/todos/{id}` - Delete a task
- `GET /api/custom_plugin/todos/search?q={query}` - Search tasks

## Data Model

Tasks have the following properties:

- `id` - Unique identifier
- `title` - Task title
- `description` - Task description
- `status` - Task status (planned, in_progress, completed, error)
- `priority` - Task priority (low, medium, high)
- `tags` - Array of tags
- `createdAt` - Creation timestamp

## Development

### Prerequisites

- Docker and Docker Compose
- Node.js and Yarn

### Setup

1. Clone the repository
2. Start the development environment:
   ```
   docker compose up -d
   ```
3. Access the OpenSearch Dashboards at http://localhost:5601
4. Login with the following credentials:
   - Username: admin
   - Password: Wazuh-1234

### Running Tests

The application includes unit tests for both frontend components and backend services. There are several ways to run the tests:

#### Within the Docker Container

Tests can be run within the Docker container:

```bash
docker exec -it dev_environment-osd-1 yarn test
```

#### From the Project Directory

If you prefer to run tests directly from your local machine:

1. Navigate to the project directory:

   ```bash
   cd src
   ```

2. Run all tests:

   ```bash
   npm test
   ```

3. Run tests in watch mode (automatically reruns tests when files change):

   ```bash
   npm test -- --watch
   ```

4. Run specific test files or patterns:

   ```bash
   npm test -- --testPathPattern=TodoForm  # Runs tests for TodoForm
   npm test -- --testPathPattern=KanbanView  # Runs tests for KanbanView
   npm test -- --testPathPattern=services  # Runs all service tests
   ```

5. Generate test coverage report:
   ```bash
   npm test -- --coverage
   ```

#### Troubleshooting Tests

If you encounter issues with the tests:

1. Make sure all dependencies are installed:

   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom @types/jest
   ```

2. Check for linter errors that might indicate missing type definitions:

   ```bash
   npm run lint
   ```

3. For tests involving React hooks, ensure that the components are properly mocked to avoid "Invalid hook call" errors.

## License

This project is licensed under the Apache License 2.0.
