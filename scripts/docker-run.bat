@echo off
REM ==============================================================================
REM Hanuman Gym - 1-Click Docker Startup Script (Windows)
REM ==============================================================================

echo =====================================================================
echo  HANUMAN GYM - LAUNCHING ENTERPRISE DOCKER CONTAINER STACK
echo =====================================================================
echo.

if not exist .env (
    echo [INFO] Creating .env file from .env.docker.example...
    copy .env.docker.example .env
)

echo [INFO] Building and starting all Docker services (Gateway, Web, API, DB, Adminer)...
docker compose up --build -d

if %ERRORLEVEL% equ 0 (
    echo.
    echo =====================================================================
    echo  SUCCESS: HANUMAN GYM SERVICES ARE LIVE!
    echo =====================================================================
    echo  - Web Application:         http://localhost/
    echo  - Admin Command Center:    http://localhost/admin/
    echo  - FastAPI REST Docs:       http://localhost/docs
    echo  - FastAPI Health Check:    http://localhost/api/v1/health
    echo  - Database Manager:        http://localhost:8080/
    echo  - PostgreSQL Host Port:    5432
    echo =====================================================================
    echo.
    echo Use 'docker compose logs -f' to view live application streams.
) else (
    echo.
    echo [ERROR] Failed to start Docker services. Ensure Docker Desktop is running.
)
pause
