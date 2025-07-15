#!/bin/bash
set -e

API_DOMAIN="${API_SITE_DOMAIN:-localhost:8080}"

# Wait for DB to be ready
until wp db connect --allow-root; do
  echo "Waiting for database..."
  sleep 5
done

# Install WordPress if not installed
if ! wp core is-installed --allow-root; then
  wp core install --url="http://${API_DOMAIN}" --title="Headless WP" --admin_user="admin" --admin_password="admin" --admin_email="admin@example.com" --skip-email --allow-root
  # Create additional default user
  wp user create editor editor@example.com --role=editor --user_pass=editor --allow-root
fi

# Set WP_HOME and WP_SITEURL to the custom API domain
wp option update home "http://${API_DOMAIN}" --allow-root
wp option update siteurl "http://${API_DOMAIN}" --allow-root

# Ensure REST API is enabled (remove blocks if any)
wp option delete rest_api_disabled --allow-root || true
wp plugin deactivate disable-json-api --allow-root || true

# Set permalinks to 'postname' for pretty REST API URLs
wp rewrite structure '/%postname%/' --allow-root
wp rewrite flush --hard --allow-root

# Clone Slim Theme if not already present
if [ ! -d "/var/www/html/wp-content/themes/slimtheme" ]; then
  git clone https://github.com/jcnh74/slimtheme.git /var/www/html/wp-content/themes/slimtheme
fi

# Activate Slim Theme
wp theme activate slimtheme --allow-root || true

# Install and activate Advanced Custom Fields PRO plugin if not present
if [ ! -d "/var/www/html/wp-content/plugins/advanced-custom-fields-pro" ]; then
  echo "Please manually add the Advanced Custom Fields PRO plugin to /var/www/html/wp-content/plugins/advanced-custom-fields-pro before building the image."
fi
wp plugin activate advanced-custom-fields-pro --allow-root || true

# Activate all other plugins in the plugins directory
for plugin in /var/www/html/wp-content/plugins/*; do
  if [ -d "$plugin" ]; then
    plugin_slug=$(basename "$plugin")
    wp plugin activate "$plugin_slug" --allow-root || true
  fi
done

# Start Apache (default CMD from WordPress image)
docker-entrypoint.sh apache2-foreground 