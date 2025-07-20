FROM wordpress:latest

# Install mysql client and git for wp db connect and theme cloning
RUN apt-get update && apt-get install -y default-mysql-client git && rm -rf /var/lib/apt/lists/*

# Install WP-CLI
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp

# Copy plugins and themes
COPY plugins /var/www/html/wp-content/plugins
COPY setup.sh /docker-entrypoint-init.d/setup.sh
RUN chmod +x /docker-entrypoint-init.d/setup.sh

# Set correct ownership and permissions for WordPress files
RUN chown -R www-data:www-data /var/www/html/wp-content \
    && chmod -R 755 /var/www/html/wp-content

# Expose port 80
EXPOSE 80

# Use the default WordPress entrypoint
CMD ["apache2-foreground"]