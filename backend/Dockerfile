# ==============================================================================
# Hanuman Gym - FastAPI Microservice Container
# Lightweight Python 3.11 Slim with Non-Root Execution
# ==============================================================================

FROM python:3.11-slim

# Prevent Python from writing .pyc files & enable unbuffered standard I/O
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_HOME=/app

WORKDIR ${APP_HOME}

# Install essential system dependencies (for building psycopg2/cryptography)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies with pip cache optimization
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Create a dedicated non-privileged user
RUN groupadd -r appgroup && useradd -r -g appgroup -d ${APP_HOME} -s /sbin/nologin appuser

# Copy application source code
COPY . ${APP_HOME}

# Set correct ownership
RUN chown -R appuser:appgroup ${APP_HOME}

# Switch to non-root user
USER appuser

# Expose FastAPI port
EXPOSE 8000

# Health check to ensure FastAPI is healthy and running
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Start Uvicorn ASGI Server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
