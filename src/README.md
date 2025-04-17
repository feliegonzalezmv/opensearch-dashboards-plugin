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

Tests can be run within the Docker container:

```
docker exec -it dev_environment-osd-1 yarn test
```

## License

This project is licensed under the Apache License 2.0.
