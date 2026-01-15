# -------------------------------
# Stage 0: PHP + Apache
# -------------------------------
FROM php:8.2-apache

# -------------------------------
# Install system dependencies
# -------------------------------
RUN apt-get update -yqq \
    && apt-get install -yqq --no-install-recommends \
        libcurl4-gnutls-dev \
        zlib1g-dev \
        libzip-dev \
        unzip \
        git \
        pkg-config \
        libonig-dev \
    && rm -rf /var/lib/apt/lists/*

# -------------------------------
# Install PHP extensions
# -------------------------------
RUN docker-php-ext-install zip mbstring dom

# -------------------------------
# Enable Apache modules
# -------------------------------
RUN a2enmod rewrite headers

# -------------------------------
# Set timezone
# -------------------------------
RUN echo 'date.timezone = "Europe/Zurich"' > /usr/local/etc/php/conf.d/timezone.ini

# -------------------------------
# Install Composer
# -------------------------------
COPY --from=composer:2.9 /usr/bin/composer /usr/bin/composer

# -------------------------------
# Set working directory
# -------------------------------
WORKDIR /var/www/html

# -------------------------------
# Copy application files
# -------------------------------
COPY . /var/www/html/

# -------------------------------
# Install dependencies as root
# -------------------------------
RUN composer install --no-dev --optimize-autoloader

# -------------------------------
# Create necessary directories
# -------------------------------
RUN mkdir -p /var/www/html/blacklist && chown -R www-data:www-data /var/www/html

# -------------------------------
# Expose Apache port
# -------------------------------
EXPOSE 80

# -------------------------------
# Start Apache in foreground
# -------------------------------
CMD ["apache2-foreground"]
