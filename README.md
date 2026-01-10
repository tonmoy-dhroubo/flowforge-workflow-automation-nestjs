# FlowForge NestJS

FlowForge NestJS is a multi-service workflow automation platform built with NestJS, Kafka, PostgreSQL, and MongoDB. It matches the Spring Boot FlowForge system in services, APIs, and data schemas. Each service lives under `apps/<service>` and can run independently or side-by-side using Docker.

## Getting Started

1. Install dependencies and copy the env template
   ```bash
   npm install
   copy .env.example .env
   ```
2. Start infrastructure (PostgreSQL, MongoDB, Kafka/Zookeeper)
   ```bash
   docker-compose up -d
   ```
3. Run the individual services in separate terminals
   ```bash
   npm run start:api-gateway
   npm run start:auth-service
   npm run start:workflow-service
   npm run start:trigger-service
   npm run start:orchestrator-service
   npm run start:executor-service
   npm run start:log-service
   ```

Each service exposes the same endpoints, Kafka topics, and database schemas as the Spring version. The API Gateway validates JWTs, adds the `X-User-Id` header, and routes traffic to workflows, triggers, orchestrator, executor, and logs.

See `docs/ARCHITECTURE.md` for full service breakdown and bootstrapping instructions.
