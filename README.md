# Fragment Composer

<p align="center">Microservice for fragment collection, validation, and render job dispatch in the Location-Agnostic Video Editor.</p>

## Overview

The Fragment Composer is the orchestrator of the video rendering pipeline. It manages project metadata, collects video fragments from distributed source nodes, reconciles them into a validated render manifest, and dispatches the manifest to a render engine.

```
Collect fragments → Validate → Reconcile → Dispatch manifest → Render Engine
```

## Responsibilities

- **Project & Segment API** — CRUD for projects and their video segments.
- **Fragment Collection** — Copies fragments from source nodes (local, NAS, cloud) into a staging area.
- **Reconciliation** — Validates completeness, checks file integrity, normalizes formats, and produces a render manifest.
- **Dispatch** — Sends the manifest to a render engine via HTTP and tracks job progress.

## Built with

- [Fastify](https://fastify.dev/) — High-performance Node.js web framework
- [TypeScript](https://www.typescriptlang.org/) — Static typing
- [Prisma](https://www.prisma.io/) — Database ORM (PostgreSQL)
- [RabbitMQ](https://www.rabbitmq.com/) — Message queue
- [Bun](https://bun.sh/) — Runtime and test runner

## Installation

```sh
bun install --frozen-lockfile
bun run prisma:generate
```

## Running the app

By default the "API" mode is used. Set `DEPLOYMENT_MODE` to `worker` at runtime to use the worker mode.

```sh
# Development (hot reload)
bun run dev                        # API
DEPLOYMENT_MODE=worker bun run dev # Worker

# Production
bun run build && bun run start                        # API
bun run build && DEPLOYMENT_MODE=worker bun run start # Worker
```

### With Docker

```sh
docker build -t fragment-composer .

# API
docker run --rm fragment-composer

# Worker
docker run --rm -e DEPLOYMENT_MODE=worker fragment-composer
```

### With Docker Compose

Services are organized under profiles. The `dev` profile mounts the source tree for hot reloading; the `local` profile uses the built image.

```sh
# API with hot reload
docker compose --profile dev up

# Worker with hot reload
docker compose --profile dev up worker

# Build and run API
docker compose --profile local up

# Build and run Worker
docker compose --profile local up worker-local
```

#### Database

You may need to run `bunx --bun prisma migrate dev --name init` in your terminal if you haven't already initialized the database. This only needs to be done the first time the database is created. (Or whenever the database has been recreated) This will happen automatically when using any profile in Docker Compose.

#### RabbitMQ

A RabbitMQ service is available via Docker Compose for message queue capabilities. The management UI is accessible at `http://localhost:15672`.

## Logging

Two environment variables control log verbosity independently:

- `REQUEST_LOG_LEVEL` — HTTP request logs from Fastify (every endpoint hit). Default: `info`.
- `CUSTOM_LOG_LEVEL`  — High-level event logs. Default: `info`.

Set either to `debug` for more verbosity:

```sh
REQUEST_LOG_LEVEL=info bun run dev # Show all endpoint hits
CUSTOM_LOG_LEVEL=debug bun run dev # Show debug-level custom events
```

## Test

### Lint

Eslint is used as a linter and uses Prettier to format code.

```sh
# ESLint
bun run lint

# ESLint and fix (also sorts JSON files)
# Prefix with `EXCLUDE_PATHS="<file_1> <file_2>"` to exclude files/directories (using GLOB pattern) from being auto-sorted
bun run lint:fix

# Sort a specific JSON file and/or directory
# Important: Don't run this command without a specified file/directory (using GLOB pattern)
bunx jsonsort "<file_1> <file_2>"
```

### Unit & Feature tests

```sh
# Unit tests
bun run test
bun run test:coverage

# Feature tests
bun run test:feature

# Prefix either command with `SHOW_LOGS=true` to show logs
```

Bun currently doesn't support HTML as a test coverage reporter. Therefore, a Dockerfile is provided which uses genhtml to generate the HTML coverage report. This can be run using:

```sh
bun run test:unit:coverage:html
```

You can then open `test/unit/coverage/html/index.html` to view the results:

```sh
xdg-open test/unit/coverage/html/index.html
```

### Acceptance tests

```sh
bun run test:acceptance
bun run test:acceptance:coverage
```

#### With Docker Compose

```sh
# Run once and exit
docker compose --profile test up --build --attach acceptance-once --exit-code-from acceptance-once

# Run multiple times
# There are multiple profiles that can be run for the acceptance tests:
# dev
# local
docker compose --profile <PROFILE> up --build -d && docker compose --profile <PROFILE> exec -ti dev sh -c "bun run test:acceptance"
```

### Integrity

Run this after a Bun install to verify that everything still works.

```sh
bun run integrity
```

## License

FSL-1.1-MIT