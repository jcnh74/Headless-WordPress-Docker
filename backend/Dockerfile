FROM wordpress:latest

# Install mysql client and git for wp db connect and theme cloning
RUN apt-get update && apt-get install -y default-mysql-client git && rm -rf /var/lib/apt/lists/*

# Install WP-CLI
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp

# Copy plugins and themes
# COPY plugins /var/www/html/wp-content/plugins
# COPY themes /var/www/html/wp-content/themes
COPY setup.sh /setup.sh
RUN chmod +x /setup.sh

# Entrypoint to run setup script, then start WordPress
ENTRYPOINT ["/setup.sh"]