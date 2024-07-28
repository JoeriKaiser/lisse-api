#!/bin/bash
# start-production.sh

echo "Starting production environment..."
docker compose -f docker-compose.yml -f docker-compose.production.yml up --build