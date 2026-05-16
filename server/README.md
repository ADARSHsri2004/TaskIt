# TaskIt Server

This folder contains the backend API for TaskIt. It is an Express + TypeScript + Prisma server that handles authentication, task CRUD, validation, and database access.

## What is happening in the server right now

The server starts from `src/server.ts`, loads environment variables with `dotenv`, and boots the Express app defined in `src/app.ts`.

`src/app.ts` sets up the middleware stack in this order:

1. `cors` for cross-origin requests
2. `helmet` for basic security headers
3. `morgan("dev")` for request logging
4. `express.json()` to parse JSON bodies
5. `cookie-parser()` to read cookies
6. the root health check route `/`
7. `/api/auth` routes
8. `/api/tasks` routes
9. a 404 handler for unknown routes
10. the global error handler

So the current workflow is:

Request -> middleware -> route -> validation/auth check -> controller -> Prisma/database -> JSON response

## Main flow of the API

### 1. Server startup

- `src/server.ts` reads `PORT` from the environment and listens on port `5000` by default.
- `src/config/db.ts` creates the Prisma client using the PostgreSQL connection in `DATABASE_URL`.
- Prisma is generated into `src/generated/prisma/`.

### 2. Authentication flow

Auth routes live in `src/routes/auth.routes.ts`.

- `POST /api/auth/register`
  - Validates the request body with `registerSchema`
  - Checks if the user already exists
  - Hashes the password with `bcryptjs`
  - Creates the user in Prisma

- `POST /api/auth/login`
  - Validates the request body with `loginSchema`
  - Looks up the user by email
  - Compares the password hash
  - Creates an access token and refresh token
  - Sends the refresh token as an HTTP-only cookie named `refreshToken`
  - Returns the access token and public user data

- `POST /api/auth/logout`
  - Clears the `refreshToken` cookie

- `GET /api/auth/me`
  - Protected by the JWT middleware
  - Reads the current user from Prisma using `req.user.id`
  - Returns the public profile fields

### 3. Task flow

Task routes live in `src/routes/task.routes.ts`.

All task routes use `protect`, so a valid `Authorization: Bearer <token>` header is required.

- `POST /api/tasks`
  - Validates task data with `createTaskSchema`
  - Creates a task in Prisma
  - Uses `req.user.id` as `createdById`

- `GET /api/tasks`
  - Supports query filters for `status` and `priority`
  - Supports pagination with `page` and `limit`
  - Supports sorting with `sort`
  - Includes the related `createdBy` and `assignedTo` users

- `GET /api/tasks/:id`
  - Fetches one task by ID
  - Includes related users
  - Returns `404` if the task is missing

- `DELETE /api/tasks/:id`
  - Deletes a task by ID

### 4. Validation and protection

- `src/middlewares/validate.middleware.ts` uses Zod schemas to validate request bodies before the controller runs.
- `src/middlewares/auth.middleware.ts` checks the JWT access token from the `Authorization` header.
- If the token is missing or invalid, the request is rejected with `401`.
- `src/types/express.d.ts` extends `req.user` so the authenticated user can be accessed inside controllers.

### 5. Error handling

- `src/utils/asyncHandler.ts` wraps async controllers and forwards failures to the error middleware.
- `src/middlewares/error.middleware.ts` sends a JSON error response.
- `src/middlewares/notFound.middleware.ts` returns `404 Route Not Found` for unmatched routes.
- `src/utils/ApiError.ts` is used for intentional HTTP errors like `401`, `403`, and `404`.

## Database model

The Prisma schema in `prisma/schema.prisma` defines:

- `User`
  - `id`, `email`, `password`, `role`
  - relations for tasks the user created and tasks assigned to the user

- `Task`
  - `id`, `title`, `description`, `status`, `priority`, `dueDate`
  - `createdById` and `assignedToId`
  - relations back to `User`

Enums currently used:

- `Role`: `ADMIN`, `USER`
- `TaskStatus`: `TODO`, `IN_PROGRESS`, `COMPLETED`
- `Priority`: `LOW`, `MEDIUM`, `HIGH`

## Current implementation notes

- The auth layer is fully wired through controllers, services, validation, and JWT utilities.
- The task controller currently talks to Prisma directly, while `src/services/task.service.ts` exists as a reusable service layer but is not the main execution path yet.
- The seed script creates a default admin user:
  - email: `admin@test.com`
  - password: `123456`
  - role: `ADMIN`

## Scripts

From `package.json`:

- `npm run dev` - start the server in watch mode using `ts-node-dev`
- `npm run build` - compile TypeScript into `dist/`
- `npm start` - run the compiled server from `dist/server.js`

Prisma seed command:

- `npm run prisma seed` uses `ts-node prisma/seed.ts`

## Environment variables

The server expects these environment variables:

- `PORT` - optional, defaults to `5000`
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - secret for access tokens
- `JWT_REFRESH_SECRET` - secret for refresh tokens
- `NODE_ENV` - used to decide whether Prisma client should be reused globally in development

## Folder purpose

- `src/app.ts` - Express app setup and middleware chain
- `src/server.ts` - process entrypoint
- `src/routes/` - route definitions
- `src/controllers/` - request handlers
- `src/services/` - database helper layer
- `src/middlewares/` - auth, validation, and error handling
- `src/validators/` - Zod schemas
- `src/utils/` - shared helpers
- `prisma/` - schema, migrations, and seed script

## In short

The server is a TaskIt backend that already supports user registration, login, token-based protection, task creation, task listing, task lookup, and task deletion. The request flow is already structured around validation and JWT protection, with Prisma handling all database reads and writes.