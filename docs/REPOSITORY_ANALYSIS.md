# Repository Analysis - PasswordCards

**Date:** January 15, 2026  
**Repository:** cjemorton/passwordcards  
**Original Author:** Raphael Zimmermann (raphiz)

## Executive Summary

This repository is a PHP-based web application that generates customizable password cards inspired by Qwertycards.com. The application allows users to create personalized password cards with various patterns, keyboard layouts, and colors, which are then rendered as downloadable PDF files.

---

## Current State of Repository

### 1. Project Architecture

**Technology Stack:**
- **Language:** PHP (targeting PHP 8.2 in Docker)
- **Web Server:** Apache with mod_rewrite
- **PDF Generation:** TCPDF library (version 6.2.11)
- **Templating:** Rain TPL (version 3.1.0)
- **Testing:** PHPUnit (version 4.8.3)
- **Dependency Management:** Composer

**Core Components:**
1. **CardCreator** (`src/CardCreator.php`) - Main class for rendering SVG templates with random characters
2. **Configuration** (`src/Configuration.php`) - Handles configuration and pattern parsing
3. **PDFRenderer** (`src/PDFRenderer.php`) - Renders SVG templates into PDF documents
4. **RequestUtils** (`src/RequestUtils.php`) - Handles HTTP request parsing and spam prevention
5. **index.php** - Main entry point that orchestrates the workflow

### 2. File Structure

```
passwordcards/
├── src/                    # PHP source code
│   ├── CardCreator.php
│   ├── Configuration.php
│   ├── PDFRenderer.php
│   └── RequestUtils.php
├── tests/                  # PHPUnit tests
│   ├── CardCreatorTest.php
│   └── ConfigurationTest.php
├── templates/              # SVG templates for cards
│   ├── simple_back.svg
│   └── simple_front.svg
├── resources/              # Static web resources (HTML, CSS, JS, images)
├── apache/                 # Docker configuration
│   └── Dockerfile
├── index.php               # Application entry point
├── composer.json           # PHP dependencies
├── docker-compose.yml      # Docker orchestration
├── phpunit.xml             # PHPUnit configuration
├── .htaccess              # Apache configuration
└── deploy.sh              # Deployment script (uses lftp)
```

### 3. Application Workflow

1. User accesses the application and sees a form (rendered via Rain TPL)
2. User submits form with customization options:
   - Pattern (characters to use: numbers, lowercase, uppercase, symbols)
   - Keyboard layout (QWERTY or QWERTZ)
   - Seed (for reproducibility)
   - Colors (primary and secondary)
   - Custom text message
   - Spacebar size
3. Application validates request and implements spam prevention
4. SVG templates are loaded and populated with random characters based on configuration
5. SVG files are temporarily written to `/tmp`
6. TCPDF renders both SVG files into a single PDF
7. PDF is streamed to user as download
8. Temporary files are cleaned up

### 4. Security Features

**Positive:**
- Spam prevention mechanism using IP-based rate limiting (5 cards per 5 minutes)
- Input validation and sanitization:
  - Color validation with regex
  - Pattern validation
  - Text length limits (20 characters)
  - Spacebar size validation (1-8 range)
- HTML entity escaping for XML output
- HTTPS enforcement via .htaccess
- HSTS headers configured
- Restricted file access via .htaccess (only index.php and resources/)

**Concerns:**
- Blacklist files stored in `blacklist/` directory (not created automatically)
- No CSRF protection on POST requests
- Old PHPUnit version (4.8.3) - security updates may be missing
- Deprecated PHPUnit test syntax (`PHPUnit_Framework_TestCase`)

### 5. Code Quality

**Positive:**
- PSR-4 autoloading
- Separation of concerns (distinct classes for different responsibilities)
- Unit tests for core logic
- CI/CD integration (Wercker, Scrutinizer)
- Code coverage tracking (CodeClimate)

**Issues:**
- Typo: `$configration` instead of `$configuration` in CardCreator.php (line 7, 9, 15, 22)
- Deprecated PHPUnit syntax in tests
- Old dependency versions
- No type hints (PHP 7+ feature not used)
- No return type declarations
- Legacy `mt_srand()` and `mt_rand()` usage (modern PHP should use random_int())

---

## Dockerfile Build Problems

### Critical Issue 1: Invalid COPY Context Path

**Location:** `apache/Dockerfile`, line 68

```dockerfile
COPY --chown=${APACHE_USER}:${APACHE_GROUP} ../build/ /var/www/html/
```

**Problem:**
The Dockerfile references `../build/` directory, which:
1. **Does not exist** in the repository
2. Uses a **parent directory reference** (`../`) which is problematic in Docker builds
3. Violates Docker's build context rules

**Impact:**
- Docker build will **fail** with error: `COPY failed: file not found in build context`
- The build context is set to `./apache` in docker-compose.yml, so `../build/` would attempt to copy from the repository root, but the directory doesn't exist

**Root Cause:**
This appears to be a misconfiguration. The Dockerfile seems to expect a pre-built deployment directory that doesn't exist in the repository.

### Critical Issue 2: Missing Build/Deployment Directory

**Problem:**
There is no `build/` directory in the repository, and no build script to create it.

**Expected Behavior (Based on deploy.sh):**
The `deploy.sh` script shows the intended workflow:
1. Create archive from git repository
2. Extract to temporary directory
3. Run `composer install --no-dev --optimize-autoloader`
4. Deploy via FTP

**What's Missing:**
The Dockerfile doesn't follow this workflow. It expects a pre-existing `build/` directory.

### Critical Issue 3: Docker Build Context Mismatch

**Location:** `docker-compose.yml`, lines 3-5

```yaml
build:
  context: ./apache
  dockerfile: Dockerfile
```

**Problem:**
- Build context is `./apache` (only contains the Dockerfile)
- Source code is in parent directory
- Even if we fix the COPY path, the source files won't be accessible

### Issue 4: Running as Non-Root but Starting Apache

**Location:** `apache/Dockerfile`, lines 58, 84

```dockerfile
USER ${APACHE_USER}    # Line 58 - switches to non-root user
...
CMD ["apache2-foreground"]    # Line 84 - tries to start Apache
```

**Problem:**
- Apache requires root privileges to bind to port 80
- The Dockerfile switches to a non-root user but then tries to start Apache
- This will likely cause permission issues

### Issue 5: PHP Extension Installation Issues

**Location:** `apache/Dockerfile`, line 27

```dockerfile
RUN docker-php-ext-install zip curl mbstring xml
```

**Problem:**
- `curl` is not a valid PHP extension name for `docker-php-ext-install`
- `xml` is also not specific enough (should be something like `dom` or `xmlreader`)
- The build will fail at this step

### Issue 6: Composer Running as Non-Root After Switching Users

**Location:** `apache/Dockerfile`, lines 55, 58, 73

```dockerfile
ENV COMPOSER_ALLOW_SUPERUSER=0    # Line 55
USER ${APACHE_USER}               # Line 58
RUN composer self-update --stable # Line 73
```

**Problem:**
- `composer self-update` requires write access to composer binary
- After switching to non-root user, this command will likely fail
- The environment variable `COMPOSER_ALLOW_SUPERUSER=0` further restricts this

---

## Recommended Fixes for Dockerfile

### Fix 1: Correct the Build Context and COPY Instructions

**Option A: Change docker-compose.yml (Recommended)**

```yaml
services:
  web:
    build:
      context: .                    # Changed from ./apache
      dockerfile: apache/Dockerfile # Specify Dockerfile location
    container_name: passwordcards_web
    ports:
      - "8000:80"
    restart: unless-stopped
```

Then update Dockerfile line 68:
```dockerfile
COPY --chown=${APACHE_USER}:${APACHE_GROUP} . /var/www/html/
```

**Option B: Keep Current Context, Copy from Parent**

This is not recommended due to Docker limitations, but if needed:
```dockerfile
# Would require changing build context in docker-compose.yml
```

### Fix 2: Fix PHP Extension Installation

```dockerfile
# Replace line 27
RUN docker-php-ext-install zip mbstring dom
```

Note: `curl` support is already in base image; `dom` provides XML functionality.

### Fix 3: Fix Apache Permission Issues

**Option A: Run Apache as Root (Common Pattern)**

Remove or modify the USER directive:
```dockerfile
# Remove line 58: USER ${APACHE_USER}
# Or move it to after Apache setup but before composer install
```

**Option B: Configure Apache to Run as Non-Root (Complex)**

This requires additional Apache configuration changes and is more complex.

### Fix 4: Fix Composer Self-Update

Move `composer self-update` before switching users:
```dockerfile
# Do this before USER ${APACHE_USER}
RUN composer self-update --stable

# Then switch user
USER ${APACHE_USER}

# Then run install
RUN composer install --no-dev --optimize-autoloader
```

### Fix 5: Remove Unnecessary Build Flag

Remove `--ignore-platform-reqs` unless specifically needed:
```dockerfile
RUN composer install --no-dev --optimize-autoloader
```

---

## Additional Recommendations

### 1. Update Dependencies

**Critical Updates:**
- PHPUnit: 4.8.3 → 9.x or 10.x (4.8.3 is from 2015)
- Consider updating TCPDF to latest version
- Update Composer version reference

### 2. Create Missing Directories

The application expects these directories to exist:
- `blacklist/` (for spam prevention)
- `vendor/` (created by composer)

Add to .gitignore:
```
/vendor/
/blacklist/
```

Add to Dockerfile or application initialization:
```php
if (!file_exists(__DIR__ . '/blacklist')) {
    mkdir(__DIR__ . '/blacklist', 0755, true);
}
```

### 3. Fix Code Quality Issues

- Fix typo: `$configration` → `$configuration`
- Update PHPUnit test syntax
- Add type hints and return types (PHP 7.4+)
- Replace `mt_rand()` with `random_int()` for better security

### 4. Security Enhancements

- Add CSRF token protection
- Consider using PHP sessions for rate limiting instead of file-based
- Add input validation for SVG template names
- Consider Content Security Policy headers

### 5. Documentation

- Add setup instructions for Docker
- Document environment variables
- Add API/usage documentation
- Document the spam prevention mechanism

---

## Complete Fixed Dockerfile

Here's a complete working Dockerfile:

```dockerfile
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
```

---

## Testing the Fixed Dockerfile

To test the fixes:

```bash
# Build the image
docker-compose build

# Run the container
docker-compose up -d

# Check logs
docker-compose logs

# Test the application
curl http://localhost:8000

# Stop the container
docker-compose down
```

---

## Conclusion

The passwordcards repository is a well-structured PHP application with good separation of concerns and security practices. However, the Dockerfile has several critical issues that prevent it from building successfully:

1. **Non-existent build directory reference**
2. **Incorrect Docker build context**
3. **Invalid PHP extension names**
4. **Permission issues with non-root user running Apache**
5. **Composer self-update permission issues**

All of these issues are fixable with the recommendations provided above. The core application code is solid and follows good practices, but the containerization needs to be corrected to match the actual repository structure.
