# ================================
# Stock Daily - Makefile
# ================================
# Simplified commands for development and deployment

.PHONY: help dev prod build up down restart logs status clean backup migrate

# Default target
help:
	@echo "Stock Daily - Available Commands"
	@echo "================================="
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-down     - Stop development environment"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-down    - Stop production environment"
	@echo "  make build        - Build production images"
	@echo ""
	@echo "Common:"
	@echo "  make logs         - View all service logs"
	@echo "  make logs-backend - View backend logs only"
	@echo "  make status       - Show service status"
	@echo "  make restart      - Restart all services"
	@echo "  make clean        - Remove containers and volumes"
	@echo ""
	@echo "Database:"
	@echo "  make migrate      - Run database migrations"
	@echo "  make backup       - Create database backup"
	@echo "  make db-shell     - Open PostgreSQL shell"
	@echo ""
	@echo "Setup:"
	@echo "  make setup        - Initial setup (copy env files)"
	@echo "  make check        - Check environment configuration"

# ================================
# Setup
# ================================
setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env from .env.example"; \
		echo "Please update .env with your configuration!"; \
	else \
		echo ".env already exists"; \
	fi

check:
	@echo "Checking environment..."
	@if [ ! -f .env ]; then \
		echo "ERROR: .env file not found. Run 'make setup' first."; \
		exit 1; \
	fi
	@echo "Environment file: OK"
	@docker --version > /dev/null 2>&1 && echo "Docker: OK" || echo "Docker: NOT FOUND"
	@docker compose version > /dev/null 2>&1 && echo "Docker Compose: OK" || echo "Docker Compose: NOT FOUND"

# ================================
# Development
# ================================
dev:
	docker compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3000"

dev-down:
	docker compose -f docker-compose.dev.yml down

dev-logs:
	docker compose -f docker-compose.dev.yml logs -f

# ================================
# Production
# ================================
prod: check
	docker compose up -d --build
	@echo ""
	@echo "Production environment started!"
	@echo "Application: http://localhost"

prod-down:
	docker compose down

build:
	docker compose build --no-cache

# ================================
# Common Operations
# ================================
up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down
	docker compose up -d

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f postgres

status:
	docker compose ps

clean:
	@echo "WARNING: This will remove all containers and volumes!"
	@read -p "Are you sure? (y/N) " confirm && [ "$$confirm" = "y" ] && \
		docker compose down -v --rmi local || echo "Cancelled"

# ================================
# Database Operations
# ================================
migrate:
	docker compose exec backend npx prisma migrate deploy

db-shell:
	docker compose exec postgres psql -U $${POSTGRES_USER:-stockuser} -d $${POSTGRES_DB:-stockdaily}

backup:
	@./scripts/backup.sh

# ================================
# Health Check
# ================================
health:
	@echo "Checking service health..."
	@curl -s http://localhost/health > /dev/null && echo "Backend: OK" || echo "Backend: FAILED"
	@curl -s http://localhost > /dev/null && echo "Frontend: OK" || echo "Frontend: FAILED"
