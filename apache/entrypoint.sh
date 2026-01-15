#!/bin/bash
set -euo pipefail

# Default to 'dev' mode if HTACCESS_MODE is not set
HTACCESS_MODE=${HTACCESS_MODE:-dev}

echo "=== Password Cards Entrypoint ==="
echo "HTACCESS_MODE: $HTACCESS_MODE"

# Verify template files exist
if [ ! -f /var/www/html/.htaccess.dev ] || [ ! -f /var/www/html/.htaccess.prod ]; then
    echo "ERROR: .htaccess template files not found!"
    echo "Expected: /var/www/html/.htaccess.dev and /var/www/html/.htaccess.prod"
    exit 1
fi

# Copy the appropriate .htaccess file based on the mode
if [ "$HTACCESS_MODE" = "prod" ]; then
    echo "Using production .htaccess (strict: HTTPS enforced, path restrictions enabled)"
    cp /var/www/html/.htaccess.prod /var/www/html/.htaccess
elif [ "$HTACCESS_MODE" = "dev" ]; then
    echo "Using development .htaccess (relaxed: no HTTPS, no path restrictions)"
    cp /var/www/html/.htaccess.dev /var/www/html/.htaccess
else
    echo "ERROR: Invalid HTACCESS_MODE '$HTACCESS_MODE'."
    echo "Valid values are: 'dev' or 'prod'."
    echo "Cannot start with invalid configuration."
    exit 1
fi

echo "=== Starting Apache ==="

# Execute the CMD (apache2-foreground)
exec "$@"
