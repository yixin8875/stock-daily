#!/bin/bash
# ================================
# Stock Daily - Deployment Script
# ================================
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Stock Daily - Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Change to project directory
cd "$PROJECT_DIR"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found.${NC}"
    echo -e "${YELLOW}Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}Please update .env with your production values!${NC}"
    exit 1
fi

# Parse command line arguments
ACTION=${1:-"help"}

case $ACTION in
    "up"|"start")
        echo -e "${GREEN}Starting services...${NC}"
        docker compose up -d --build
        echo -e "${GREEN}Services started successfully!${NC}"
        echo -e "${GREEN}Frontend available at: http://localhost${NC}"
        ;;
    "down"|"stop")
        echo -e "${YELLOW}Stopping services...${NC}"
        docker compose down
        echo -e "${GREEN}Services stopped.${NC}"
        ;;
    "restart")
        echo -e "${YELLOW}Restarting services...${NC}"
        docker compose down
        docker compose up -d --build
        echo -e "${GREEN}Services restarted successfully!${NC}"
        ;;
    "logs")
        SERVICE=${2:-""}
        if [ -n "$SERVICE" ]; then
            docker compose logs -f "$SERVICE"
        else
            docker compose logs -f
        fi
        ;;
    "status")
        docker compose ps
        ;;
    "health")
        echo -e "${BLUE}Checking service health...${NC}"
        echo -n "Backend API: "
        if curl -s http://localhost/health > /dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${RED}FAILED${NC}"
        fi
        echo -n "Frontend: "
        if curl -s http://localhost > /dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${RED}FAILED${NC}"
        fi
        echo -n "Database: "
        if docker compose exec -T postgres pg_isready -U stockuser > /dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${RED}FAILED${NC}"
        fi
        echo -n "Redis: "
        if docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${RED}FAILED${NC}"
        fi
        ;;
    "migrate")
        echo -e "${BLUE}Running database migrations...${NC}"
        docker compose exec backend npx prisma migrate deploy
        echo -e "${GREEN}Migrations completed.${NC}"
        ;;
    "clean")
        echo -e "${RED}Warning: This will remove all containers and volumes!${NC}"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose down -v --rmi local
            echo -e "${GREEN}Cleanup completed.${NC}"
        fi
        ;;
    "build")
        echo -e "${GREEN}Building images...${NC}"
        docker compose build --no-cache
        echo -e "${GREEN}Build completed.${NC}"
        ;;
    "shell")
        SERVICE=${2:-"backend"}
        echo -e "${BLUE}Opening shell in $SERVICE...${NC}"
        docker compose exec "$SERVICE" sh
        ;;
    "db")
        echo -e "${BLUE}Opening PostgreSQL shell...${NC}"
        docker compose exec postgres psql -U stockuser -d stockdaily
        ;;
    "help"|*)
        echo "Usage: $0 <command> [options]"
        echo ""
        echo "Commands:"
        echo "  up|start     - Start all services"
        echo "  down|stop    - Stop all services"
        echo "  restart      - Restart all services"
        echo "  logs [svc]   - View logs (optionally for specific service)"
        echo "  status       - Show service status"
        echo "  health       - Check service health"
        echo "  migrate      - Run database migrations"
        echo "  build        - Build images without cache"
        echo "  clean        - Remove containers, volumes, and images"
        echo "  shell [svc]  - Open shell in service (default: backend)"
        echo "  db           - Open PostgreSQL shell"
        echo ""
        echo "Examples:"
        echo "  $0 up              # Start all services"
        echo "  $0 logs backend    # View backend logs"
        echo "  $0 shell frontend  # Open shell in frontend"
        ;;
esac
