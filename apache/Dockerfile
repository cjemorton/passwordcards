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
        vim \
        curl \
        wget \
        gnupg \
    && rm -rf /var/lib/apt/lists/*

# -------------------------------
# Install PHP extensions
# -------------------------------
RUN docker-php-ext-install zip curl mbstring xml

# -------------------------------
# Enable Apache modules
# -------------------------------
RUN a2enmod rewrite headers

# -------------------------------
# Set timezone
# -------------------------------
RUN echo 'date.timezone = "Europe/Zurich"' > /usr/local/etc/php/conf.d/timezone.ini

# -------------------------------
# Add non-root user
# -------------------------------
ARG APACHE_USER=www
ARG APACHE_GROUP=www
ARG UID=1000
ARG GID=1000
RUN groupadd -g ${GID} ${APACHE_GROUP} \
    && useradd -u ${UID} -g ${GID} -s /bin/bash ${APACHE_USER} \
    && mkdir -p /var/www/html \
    && chown -R ${APACHE_USER}:${APACHE_GROUP} /var/www/html

# -------------------------------
# Install Composer as non-root
# -------------------------------
COPY --from=composer:2.9 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=0

# Switch to non-root user
USER ${APACHE_USER}

# -------------------------------
# Set working directory
# -------------------------------
WORKDIR /var/www/html

# -------------------------------
# Copy only build files
# -------------------------------
COPY --chown=${APACHE_USER}:${APACHE_GROUP} ../build/ /var/www/html/

# -------------------------------
# Update composer.lock and install dependencies
# -------------------------------
RUN composer self-update --stable \
    && composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# -------------------------------
# Expose Apache port
# -------------------------------
EXPOSE 80

# -------------------------------
# Start Apache in foreground
# -------------------------------
CMD ["apache2-foreground"]
