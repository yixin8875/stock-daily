#!/bin/bash
# ================================
# Stock Daily - Deployment Script
# ================================
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
ACTION=${1:-"up"}

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
        docker compose logs -f
        ;;
    "status")
        docker compose ps
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
    *)
        echo "Usage: $0 {up|down|restart|logs|status|clean|build}"
        echo ""
        echo "Commands:"
        echo "  up|start   - Start all services"
        echo "  down|stop  - Stop all services"
        echo "  restart    - Restart all services"
        echo "  logs       - View service logs"
        echo "  status     - Show service status"
        echo "  clean      - Remove containers, volumes, and images"
        echo "  build      - Build images without cache"
        exit 1
        ;;
esac
