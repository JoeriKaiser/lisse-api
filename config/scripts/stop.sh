#!/bin/bash
# stop-environment.sh

echo "Stopping and removing containers..."
docker compose down

echo "Removing volumes..."
docker volume prune -f