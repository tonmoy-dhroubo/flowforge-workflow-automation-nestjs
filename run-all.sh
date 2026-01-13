#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT/.run/pids"
LOG_DIR="$ROOT/.run/logs"
SERVICES=(api-gateway auth-service workflow-service trigger-service orchestrator-service executor-service log-service)

mkdir -p "$PID_DIR" "$LOG_DIR"

usage() {
  cat <<'EOF'
Usage: ./run-all.sh

Starts all Flowforge NestJS services and writes logs to ./.run/logs.
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

DEFAULT_DB_HOST="${FLOWFORGE_DATASOURCE_HOST:-localhost:5432}"
DEFAULT_DB_NAME="${FLOWFORGE_DATASOURCE_DB_NAME:-devdb}"
DEFAULT_DB_USERNAME="${FLOWFORGE_DATASOURCE_USERNAME:-dev}"
DEFAULT_DB_PASSWORD="${FLOWFORGE_DATASOURCE_PASSWORD:-devpass}"
DEFAULT_DB_PARAMS="${FLOWFORGE_DATASOURCE_PARAMS:-sslmode=require&channel_binding=require}"

POSTGRES_HOST="${POSTGRES_HOST:-$DEFAULT_DB_HOST}"
POSTGRES_DB="${POSTGRES_DB:-$DEFAULT_DB_NAME}"
POSTGRES_USER="${POSTGRES_USER:-$DEFAULT_DB_USERNAME}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$DEFAULT_DB_PASSWORD}"
POSTGRES_PARAMS="${POSTGRES_PARAMS:-$DEFAULT_DB_PARAMS}"
POSTGRES_URL="${POSTGRES_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}/${POSTGRES_DB}?${POSTGRES_PARAMS}}"

KAFKA_BROKERS="${KAFKA_BROKERS:-localhost:9092}"
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017/flowforge_logs}"
APPLICATION_SECURITY_JWT_SECRET_KEY="${APPLICATION_SECURITY_JWT_SECRET_KEY:-dev-secret-key-please-change-dev-secret-key-please-change}"

printf "\nFlowforge NestJS services\n"
printf "Logs: %s\n" "$LOG_DIR"
printf "Status: ./status-all.sh | Stop: ./stop-all.sh\n\n"

is_running() {
  local pid_file="$1"
  [ -f "$pid_file" ] || return 1
  local pid
  pid="$(cat "$pid_file")"
  kill -0 "$pid" 2>/dev/null
}

start_service() {
  local name="$1"
  local schema="$2"

  local pid_file="$PID_DIR/$name.pid"
  if is_running "$pid_file"; then
    printf "%-24s %s\n" "$name" "already running (pid $(cat "$pid_file"))"
    return
  fi

  local log_file="$LOG_DIR/$name.log"
  POSTGRES_URL="$POSTGRES_URL" \
  POSTGRES_SCHEMA="$schema" \
  POSTGRES_HOST="$POSTGRES_HOST" \
  POSTGRES_DB="$POSTGRES_DB" \
  POSTGRES_USER="$POSTGRES_USER" \
  POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  POSTGRES_PARAMS="$POSTGRES_PARAMS" \
  KAFKA_BROKERS="$KAFKA_BROKERS" \
  MONGO_URI="$MONGO_URI" \
  APPLICATION_SECURITY_JWT_SECRET_KEY="$APPLICATION_SECURITY_JWT_SECRET_KEY" \
  nohup npm run start:$name >"$log_file" 2>&1 &
  echo $! >"$pid_file"
  printf "%-24s %s\n" "$name" "started (pid $(cat "$pid_file"), log $log_file)"
}

start_service api-gateway ""
start_service auth-service "auth"
start_service workflow-service "workflow"
start_service trigger-service "trigger_service"
start_service orchestrator-service "orchestrator"
start_service executor-service ""
start_service log-service ""
