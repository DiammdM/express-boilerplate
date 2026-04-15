# Express Boilerplate

A production-oriented Express 5 boilerplate built with TypeScript, Prisma, PostgreSQL, JWT authentication, request validation, and baseline security middleware.

This repository gives you a practical starting point for building an API with:

- Type-safe Express handlers
- Prisma ORM with PostgreSQL
- JWT-based authentication
- Zod request validation
- Rate limiting, CORS, and Helmet
- PM2 deployment support
- Vitest unit tests

## Tech Stack

- Node.js
- Express 5
- TypeScript
- Prisma
- PostgreSQL
- JSON Web Tokens (`jsonwebtoken`)
- Zod
- Vitest
- PM2

## Features

- User registration with hashed passwords via `bcryptjs`
- User login with JWT token issuance
- Protected routes with bearer-token authentication
- Request body validation with readable error messages
- Configurable CORS allowlist
- Global and route-specific rate limiting
- Graceful shutdown for the HTTP server and Prisma client
- Basic PM2 process configuration for production

## Project Structure

```text
.
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── controller/
│   ├── lib/
│   ├── middleware/
│   ├── router/
│   ├── types/
│   ├── utils/
│   └── validators/
├── test/
├── ecosystem.config.json
├── package.json
└── tsconfig.json
```

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create your environment file

Create a `.env` file in the project root:

```env
PORT=8080
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/express_boilerplate
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
JWT_ISSUER=express-boilerplate
JWT_AUDIENCE=express-boilerplate-client
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
TRUST_PROXY=false
```

### 3. Run database migrations

```bash
pnpm prisma migrate dev
```

### 4. Start the development server

```bash
pnpm dev
```

The API will start on `http://localhost:8080` unless `PORT` is overridden.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs |
| `PORT` | No | HTTP port, defaults to `8080` |
| `NODE_ENV` | No | Runtime environment, typically `development` or `production` |
| `JWT_EXPIRES_IN` | No | JWT expiration time, defaults to `7d` |
| `JWT_ISSUER` | No | Optional JWT issuer claim |
| `JWT_AUDIENCE` | No | Optional JWT audience claim |
| `CORS_ORIGINS` | No | Comma-separated allowlist of frontend origins |
| `TRUST_PROXY` | No | Proxy setting for Express; supports `false`, `true`, or a hop count |

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the app in watch mode with `tsx` |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run the compiled server |
| `pnpm test` | Run Vitest tests |
| `pnpm start:pm2` | Build the app and start it with PM2 |
| `pnpm restart:pm2` | Restart the PM2 process and refresh environment variables |
| `pnpm stop:pm2` | Stop the PM2 process |
| `pnpm logs:pm2` | Tail PM2 logs |

## API Overview

### Authentication

#### `POST /auth/register`

Create a new user account.

Request body:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com",
      "createAt": "2026-04-10T03:40:31.000Z"
    }
  }
}
```

#### `POST /auth/login`

Authenticate a user and return a bearer token.

Request body:

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    },
    "token": "your-jwt-token"
  }
}
```

### Protected Routes

All `/movie/*` and `/user/*` routes require:

```http
Authorization: Bearer <token>
```

#### `GET /user/:id`

Fetch a user by ID.

#### `GET /movie/hello`

Returns a sample protected response.

#### `GET /movie`

Returns a sample `GET` response.

#### `POST /movie`

Returns a sample `POST` response.

#### `PUT /movie`

Returns a sample `PUT` response.

#### `DELETE /movie`

Returns a sample `DELETE` response.

## Validation and Security

- Request validation is handled with Zod before controller logic runs.
- Passwords are hashed with `bcryptjs`.
- JWT verification checks token validity and ensures the user still exists.
- Helmet is enabled with API-friendly defaults.
- CORS is restricted to configured origins.
- Global rate limiting is enabled for all routes.
- Stricter rate limits are applied to `/auth/register` and `/auth/login`.

Current rate-limit defaults:

- Global API limit: `100` requests per `15 minutes`
- Login limit: `10` failed attempts per `15 minutes`
- Registration limit: `5` requests per `1 hour`

## Testing

Run the test suite with:

```bash
pnpm test
```

The existing tests cover:

- Authentication middleware behavior
- Validation middleware behavior
- Auth schema validation messages
- Security helpers such as CORS and rate limiting

## Production

This project includes a PM2 config in `ecosystem.config.json`.

Typical production flow:

```bash
pnpm build
pnpm start:pm2
```

Make sure production environment variables are available before starting PM2.

## Notes

- Prisma loads `DATABASE_URL` from the environment at startup.
- The server performs graceful shutdown on `SIGINT`, `SIGTERM`, uncaught exceptions, and unhandled promise rejections.
- The current `/movie` routes are placeholders and can be replaced with real business logic.

## License

ISC
