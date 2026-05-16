# TaskIt

TaskIt is a full-stack task management application with role-based access, task assignment, filters, PDF attachments, and an admin dashboard. The frontend is built with React, TypeScript, Vite, Redux Toolkit, and Tailwind CSS. The backend is an Express + TypeScript API backed by PostgreSQL through Prisma.

## Features

- User registration, login, logout, and current-user lookup
- JWT-protected API routes
- Admin and user roles
- Task CRUD with status, priority, due date, assignee, search, sorting, and pagination
- PDF attachments with a maximum of 3 files per task and 5 MB per file
- Admin user management and dashboard statistics
- Unit, integration, and end-to-end test setup
- Docker Compose setup for Postgres, API, and client

## Tech Stack

| Area | Tools |
| --- | --- |
| Client | React 18, TypeScript, Vite, React Router, Redux Toolkit, Axios, Tailwind CSS, Lucide React |
| Server | Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL, Zod, JWT, Multer |
| Testing | Jest, React Testing Library, Supertest, Cypress |
| DevOps | Docker, Docker Compose |

## Project Structure

```text
TaskIt/
  client/                 React + Vite frontend
    src/
      api/                Axios client and API configuration
      components/         Shared UI components
      features/           Redux feature slices
      pages/              Route-level page components
      routes/             Protected routes and app routing
      store/              Redux store configuration
    tests/                Client unit/integration tests
    cypress/              Browser E2E tests

  server/                 Express + Prisma backend
    prisma/               Schema, migrations, and seed script
    src/
      config/             Database, logger, and upload configuration
      controllers/        HTTP request handlers
      middlewares/        Auth, role checks, validation, errors, 404s
      routes/             Express route definitions
      services/           Reusable business/data helpers
      utils/              JWT, file storage, async/error helpers
      validators/         Zod request schemas
    tests/                Server unit/controller/service tests

  docs/
    TaskIt.postman_collection.json

  docker-compose.yml      Local multi-service environment
  TESTING.md              Detailed testing documentation
```

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop, recommended for the fastest setup
- PostgreSQL 15+, only required if running without Docker

## Quick Start with Docker

From the repository root:

```bash
docker compose up --build
```

This starts:

- Client: `http://localhost:5173`
- Server: `http://localhost:5000`
- Postgres: `localhost:5432`

The server container runs Prisma migrations, seeds the database, and starts in development mode. The seed script creates an admin account:

```text
email: admin@test.com
password: 123456
role: ADMIN
```

Stop the stack with:

```bash
docker compose down
```

To also remove persisted database and upload volumes:

```bash
docker compose down -v
```

## Manual Local Setup

Use this path when you want to run the database separately or work on each app directly.

### 1. Start PostgreSQL

Create a PostgreSQL database named `taskit`, or start only the database service from Compose:

```bash
docker compose up postgres
```

### 2. Configure the Server

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskit
JWT_SECRET=taskit_access_secret
JWT_REFRESH_SECRET=taskit_refresh_secret
```

Install dependencies and prepare the database:

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

The API should now respond at `http://localhost:5000`.

### 3. Configure the Client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

The client currently points to `http://localhost:5000/api` in `client/src/api/axios.ts`.

## Common Scripts

Run these from the relevant package folder.

### Server

```bash
npm run dev            # Start Express with ts-node-dev
npm run build          # Compile TypeScript
npm start              # Run compiled dist/server.js
npm test               # Run Jest tests
npm run test:coverage  # Run Jest with coverage
```

### Client

```bash
npm run dev            # Start Vite dev server
npm run build          # Type-check and build for production
npm run lint           # Run ESLint
npm test               # Run Jest tests
npm run test:e2e:run   # Run Cypress E2E tests headlessly
```

Additional testing details are documented in `TESTING.md`, `TEST-GUIDE.md`, and `TESTING-SUMMARY.md`.

## API Documentation

An importable Postman collection is included at:

```text
docs/TaskIt.postman_collection.json
```

To use it:

1. Open Postman.
2. Import `docs/TaskIt.postman_collection.json`.
3. Keep `baseUrl` set to `http://localhost:5000`.
4. Run `Auth / Login` to automatically save `accessToken` in the collection variables.
5. Use the protected task and admin requests.

### Authentication

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

Login also sets an HTTP-only `refreshToken` cookie. The current backend uses the access token for protected API authorization.

### Endpoint Summary

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | API health check |
| `POST` | `/api/auth/register` | Public | Register a user |
| `POST` | `/api/auth/login` | Public | Login and receive an access token |
| `POST` | `/api/auth/logout` | Public | Clear the refresh token cookie |
| `GET` | `/api/auth/me` | User/Admin | Get the current user |
| `GET` | `/api/tasks` | User/Admin | List tasks with filters, sorting, and pagination |
| `POST` | `/api/tasks` | User/Admin | Create a task, optionally with PDF files |
| `GET` | `/api/tasks/:id` | User/Admin | Get one task |
| `PUT` | `/api/tasks/:id` | User/Admin | Update a task, optionally add/remove PDFs |
| `DELETE` | `/api/tasks/:id` | User/Admin | Delete a task and its attachments |
| `GET` | `/api/tasks/file/:filename` | User/Admin | Download a task attachment |
| `GET` | `/api/admin/stats` | Admin | Get dashboard stats |
| `GET` | `/api/admin/users` | Admin | List users |
| `POST` | `/api/admin/users` | Admin | Create a user |
| `GET` | `/api/admin/users/:id` | Admin | Get one user and assigned tasks |
| `PUT` | `/api/admin/users/:id` | Admin | Update a user |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete a user and related tasks |

### Task Query Parameters

`GET /api/tasks` supports:

| Parameter | Values | Description |
| --- | --- | --- |
| `status` | `TODO`, `IN_PROGRESS`, `COMPLETED` | Filter by status |
| `priority` | `LOW`, `MEDIUM`, `HIGH` | Filter by priority |
| `dueDateFrom` | ISO date string | Include tasks due on or after this date |
| `dueDateTo` | ISO date string | Include tasks due on or before this date |
| `search` | string | Search title and description |
| `sort` | `newest`, `oldest`, `dueDateAsc`, `dueDateDesc` | Sort result order |
| `page` | number | Page number, defaults to `1` |
| `limit` | number | Page size, defaults to `10` |

## Design Decisions

- **Separated client and server packages:** The repository keeps frontend and backend concerns independent while still allowing them to run together through Docker Compose.
- **JWT access tokens plus HTTP-only refresh cookie:** The API returns an access token for `Authorization` headers and stores the refresh token in a safer HTTP-only cookie.
- **Role-based route protection:** Server middleware enforces authentication and admin-only routes. The client mirrors this with protected routes for user experience, but server authorization remains the source of truth.
- **Prisma as the database boundary:** Prisma models define users, tasks, attachments, enums, migrations, and seed data. Controllers use Prisma for current task/admin flows, while service modules hold reusable logic where it is already extracted.
- **Zod validation at route boundaries:** Auth inputs are validated before controller logic runs, reducing duplicate validation inside handlers.
- **File uploads stored outside the database:** PDF files are stored on disk, while attachment metadata is stored in PostgreSQL. Docker persists uploads with the `server_uploads` volume.
- **Admin and user data visibility:** Admins can see and manage all users/tasks. Regular users only see tasks assigned to them, enforced by backend filters and authorization checks.

## Environment Variables

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | Server listen port |
| `NODE_ENV` | No | `development` | Runtime mode |
| `DATABASE_URL` | Yes | `postgresql://postgres:password@localhost:5432/taskit` | Prisma/Postgres connection |
| `JWT_SECRET` | Yes | `taskit_access_secret` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | `taskit_refresh_secret` | Refresh token signing secret |

## Notes

- Uploaded attachments must be PDFs.
- Each task can have at most 3 attachments.
- Each uploaded file can be at most 5 MB.
- CORS is configured for `http://localhost:5173`.
- Seed data only creates the default admin if it does not already exist.
