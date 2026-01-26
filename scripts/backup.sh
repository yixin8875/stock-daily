#!/bin/bash
# ================================
# Stock Daily - Database Backup Script
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
BACKUP_DIR="${PROJECT_DIR}/backups"

# Load environment variables
if [ -f "${PROJECT_DIR}/.env" ]; then
    export $(grep -v '^#' "${PROJECT_DIR}/.env" | xargs)
fi

# Default values
POSTGRES_USER=${POSTGRES_USER:-stockuser}
POSTGRES_DB=${POSTGRES_DB:-stockdaily}
CONTAINER_NAME="stock-daily-postgres"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${POSTGRES_DB}_${TIMESTAMP}.sql.gz"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Stock Daily - Database Backup${NC}"
echo -e "${GREEN}========================================${NC}"

# Parse command line arguments
ACTION=${1:-"backup"}

case $ACTION in
    "backup")
        echo -e "${GREEN}Creating backup...${NC}"
        echo -e "Database: ${POSTGRES_DB}"
        echo -e "Output: ${BACKUP_FILE}"

        # Check if container is running
        if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            echo -e "${RED}Error: PostgreSQL container is not running!${NC}"
            exit 1
        fi

        # Create backup
        docker exec ${CONTAINER_NAME} pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} | gzip > "${BACKUP_FILE}"

        echo -e "${GREEN}Backup created successfully!${NC}"
        echo -e "File: ${BACKUP_FILE}"
        echo -e "Size: $(du -h "${BACKUP_FILE}" | cut -f1)"
        ;;

    "restore")
        RESTORE_FILE=$2
        if [ -z "$RESTORE_FILE" ]; then
            echo -e "${RED}Error: Please specify backup file to restore${NC}"
            echo "Usage: $0 restore <backup_file.sql.gz>"
            exit 1
        fi

        if [ ! -f "$RESTORE_FILE" ]; then
            echo -e "${RED}Error: Backup file not found: ${RESTORE_FILE}${NC}"
            exit 1
        fi

        echo -e "${YELLOW}Warning: This will overwrite the current database!${NC}"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}Restoring from backup...${NC}"
            gunzip -c "$RESTORE_FILE" | docker exec -i ${CONTAINER_NAME} psql -U ${POSTGRES_USER} ${POSTGRES_DB}
            echo -e "${GREEN}Restore completed successfully!${NC}"
        fi
        ;;

    "list")
        echo -e "${GREEN}Available backups:${NC}"
        ls -lh "${BACKUP_DIR}"/*.sql.gz 2>/dev/null || echo "No backups found."
        ;;

    "cleanup")
        DAYS=${2:-7}
        echo -e "${YELLOW}Removing backups older than ${DAYS} days...${NC}"
        find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${DAYS} -delete
        echo -e "${GREEN}Cleanup completed.${NC}"
        ;;

    *)
        echo "Usage: $0 {backup|restore|list|cleanup}"
        echo ""
        echo "Commands:"
        echo "  backup           - Create a new database backup"
        echo "  restore <file>   - Restore from a backup file"
        echo "  list             - List available backups"
        echo "  cleanup [days]   - Remove backups older than N days (default: 7)"
        exit 1
        ;;
esac
