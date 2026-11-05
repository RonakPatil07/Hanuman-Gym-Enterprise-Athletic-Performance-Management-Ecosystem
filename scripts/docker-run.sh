#!/usr/bin/env bash
# ==============================================================================
# Hanuman Gym - 1-Click Docker Startup Script (Linux / macOS)
# ==============================================================================

set -e

echo "====================================================================="
echo " HANUMAN GYM - LAUNCHING ENTERPRISE DOCKER CONTAINER STACK"
echo "====================================================================="
echo ""

if [ ! -f .env ]; then
    echo "[INFO] Creating .env file from .env.docker.example..."
    cp .env.docker.example .env
fi

echo "[INFO] Building and starting all Docker services (Gateway, Web, API, DB, Adminer)..."
docker compose up --build -d

echo ""
echo "====================================================================="
echo " SUCCESS: HANUMAN GYM SERVICES ARE LIVE!"
echo "====================================================================="
echo " - Web Application:         http://localhost/"
echo " - Admin Command Center:    http://localhost/admin/"
echo " - FastAPI REST Docs:       http://localhost/docs"
echo " - FastAPI Health Check:    http://localhost/api/v1/health"
echo " - Database Manager:        http://localhost:8080/"
echo " - PostgreSQL Host Port:    5432"
echo "====================================================================="
echo ""
echo "Use 'docker compose logs -f' to view live application streams."
