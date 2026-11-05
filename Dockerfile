# ==============================================================================
# Hanuman Gym - Production Web & PHP Container
# Optimized Multi-Stage PHP 8.2 + Apache Web Server
# ==============================================================================

FROM php:8.2-apache

# Install system dependencies and PostgreSQL/MySQL PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    curl \
    && docker-php-ext-install mysqli pdo pdo_mysql pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable essential Apache modules
RUN a2enmod rewrite headers expires deflate

# Copy custom Apache virtual host configuration
COPY docker/apache/gym-vhost.conf /etc/apache2/sites-available/000-default.conf

# Set working directory to Apache web root
WORKDIR /var/www/html

# Copy project source code into container
COPY . /var/www/html/

# Secure file permissions for Apache web server
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Health check to ensure web server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Expose standard HTTP port
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]
