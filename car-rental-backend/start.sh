#!/bin/bash

# Clear any stale cached config from the build stage
php artisan config:clear
php artisan cache:clear

# Cache config fresh with the real runtime environment variables
php artisan config:cache
php artisan route:cache

# Run migrations
php artisan migrate --force

# Start the server
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
