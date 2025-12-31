# FlowForge NestJS Architecture

This repository mirrors the original FlowForge platform using NestJS instead of Spring Boot. Services are implemented as independent Nest applications that share common configs and packages.

## Services

| Service | Port | Purpose |
| --- | --- | --- |
| api-gateway | 8080 | JWT validation, request routing, X-User-Id propagation, public webhook routing |
| auth-service | 8081 | User registration/login/logout, JWT minting, refresh token management |
| workflow-service | 8082 | CRUD for workflow definitions, JSON trigger/action definitions |
| trigger-service | 8083 | Trigger registration, webhook intake, scheduler + email polling, Kafka publishing |
| orchestrator-service | 8084 | Trigger consumption, workflow execution state, dispatch of ExecutionStart events |
| executor-service | 8085 | Action execution plugins (Slack, Google Sheets), emits execution results |
| log-service | 8086 | Mongo-backed execution/trigger log sink |

All services rely on the same PostgreSQL schemas, Kafka topics, and MongoDB collections as the Java implementation.

## Kafka Topics

- 	rigger.events – emitted by trigger-service, consumed by orchestrator + log-service
- xecution.start – emitted by orchestrator, consumed by executor
- xecution.result – emitted by executor, consumed by orchestrator + log-service

## Database Schemas

PostgreSQL schemas stay aligned with the Spring version:

- uth.users
- workflow.workflows
- 	rigger_service.trigger_registrations
- orchestrator.workflow_executions

MongoDB stores xecution_logs for log-service.

## Monorepo Layout

`
flowforge-nestjs/
├── apps/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── workflow-service/
│   ├── trigger-service/
│   ├── orchestrator-service/
│   ├── executor-service/
│   └── log-service/
├── libs/
│   └── common/  # shared DTOs, Kafka helpers, DB config
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
└── docs/
`

Each service has its own AppModule, controllers, DTOs, and infrastructure providers. Shared logic (DTO interfaces, Kafka and TypeORM utilities) lives under libs/common.

## Bootstrapping

1. Install dependencies: 
pm install
2. Copy .env.example to .env and fill connection strings
3. Start infrastructure: docker-compose up -d
4. Run individual services via 
pm run start:<service> (scripts defined in package.json)

Scheduler and email polling use Nest's @nestjs/schedule package. Kafka integration is via kafkajs. HTTP fan-out (API gateway, Slack Sheets plugins) uses xios.
