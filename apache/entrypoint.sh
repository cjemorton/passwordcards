#!/bin/bash
set -e

# Default to 'dev' mode if HTACCESS_MODE is not set
HTACCESS_MODE=${HTACCESS_MODE:-dev}

echo "=== Password Cards Entrypoint ==="
echo "HTACCESS_MODE: $HTACCESS_MODE"

# Copy the appropriate .htaccess file based on the mode
if [ "$HTACCESS_MODE" = "prod" ]; then
    echo "Using production .htaccess (strict: HTTPS enforced, path restrictions enabled)"
    cp /var/www/html/.htaccess.prod /var/www/html/.htaccess
elif [ "$HTACCESS_MODE" = "dev" ]; then
    echo "Using development .htaccess (relaxed: no HTTPS, no path restrictions)"
    cp /var/www/html/.htaccess.dev /var/www/html/.htaccess
else
    echo "Warning: Invalid HTACCESS_MODE '$HTACCESS_MODE'. Valid values: 'dev' or 'prod'. Defaulting to 'dev'."
    cp /var/www/html/.htaccess.dev /var/www/html/.htaccess
fi

echo "=== Starting Apache ==="

# Execute the CMD (apache2-foreground)
exec "$@"
