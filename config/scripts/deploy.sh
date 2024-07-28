#!/bin/bash
# deploy.sh

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: ./deploy.sh [local|staging|production]"
    exit 1
fi

case $ENVIRONMENT in
    local)
        echo "Deploying to local environment..."
        ./start-local.sh
        ;;
    staging)
        echo "Deploying to staging environment..."
        ./start-staging.sh
        ;;
    production)
        echo "Deploying to production environment..."
        ./start-production.sh
        ;;
    *)
        echo "Invalid environment. Use 'local', 'staging', or 'production'."
        exit 1
        ;;
esac