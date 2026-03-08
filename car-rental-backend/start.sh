#!/bin/bash

# Clear any stale cached config from the build stage
php artisan config:clear
php artisan cache:clear

# Cache config fresh with the real runtime environment variables
php artisan config:cache
php artisan route:cache

# Run migrations
if [ "$WIPE_DB" = "true" ]; then
    echo "WIPE_DB is true. Running migrate:fresh to rebuild database..."
    php artisan migrate:fresh --force
else
    php artisan migrate --force
fi
# Run seeders only if database is empty (no users yet)
USER_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null | tail -1)
if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "Database is empty. Running seeders..."
    php artisan db:seed --force
else
    echo "Database already seeded. Skipping..."
fi


# Start the server
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
