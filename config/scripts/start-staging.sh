#!/bin/bash
# start-staging.sh

echo "Starting staging environment..."
docker compose -f docker-compose.yml -f docker-compose.staging.yml up --build