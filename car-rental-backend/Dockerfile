FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    default-mysql-client

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy existing application directory
COPY . /app

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Fix storage and bootstrap/cache permissions (fixes 500 errors)
RUN mkdir -p storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    storage/logs \
    bootstrap/cache \
    && chmod -R 775 storage \
    && chmod -R 775 bootstrap/cache

# Cache Laravel config for production
RUN php artisan config:cache || true
RUN php artisan route:cache || true

# Expose port (Render sets the PORT environment variable dynamically)
EXPOSE 8000

# Run Laravel server
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
