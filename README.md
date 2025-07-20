# Headless WordPress Docker Setup

This project sets up a headless WordPress site using Docker Compose, with a WordPress backend, MariaDB database, and Next.js frontend.

## Prerequisites

- Docker and Docker Compose installed
- Node.js for frontend development

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

```
# MariaDB (Database) settings
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=your_database_name
MYSQL_USER=your_db_user
MYSQL_PASSWORD=your_db_password

# WordPress backend settings
API_SITE_DOMAIN=localhost:8080  # The domain (and port) where the WordPress backend will be accessible

# Frontend (Next.js) settings
SITE_DOMAIN=localhost:3000      # The domain (and port) where the frontend will be accessible
NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost:8080/wp-json/wp/v2  # The URL for the WordPress REST API
```

## Setup

1. Clone this repository.
2. Create a `.env` file in the project root as described above.
3. Run `docker-compose up -d` to start the services.
4. Access WordPress at `http://localhost:8080` and the frontend at `http://localhost:3000`.

## Deployment

- Copy the project to your server.
- Update `.env` and `docker-compose.yml` for server-specific settings.
- Run `docker-compose up -d` on the server.
- Run `docker-compose up --build -d; docker exec -it deployable-wordpress-1 /docker-entrypoint-init.d/setup.sh` to make sure the setup.sh not missed.

## Pushing to Private Repository

- Build and push images to Docker Hub:
  ```bash
  docker build -t yourusername/wordpress-headless ./backend
  docker push yourusername/wordpress-headless
  docker build -t yourusername/nextjs-frontend ./frontend
  docker push yourusername/nextjs-frontend
  ```
