# Headless WordPress Docker Setup

This project sets up a headless WordPress site using Docker Compose, with a WordPress backend, MariaDB database, and Next.js frontend.

## Prerequisites

- Docker and Docker Compose installed
- Node.js for frontend development

## Setup

1. Clone this repository.
2. Create a `.env` file based on `.env.example`.
3. Run `docker-compose up -d` to start the services.
4. Access WordPress at `http://localhost:8080` and frontend at `http://localhost:3000`.

## Deployment

- Copy the project to your server.
- Update `.env` and `docker-compose.yml` for server-specific settings.
- Run `docker-compose up -d` on the server.

## Pushing to Private Repository

- Build and push images to Docker Hub:
  ```bash
  docker build -t yourusername/wordpress-headless ./backend
  docker push yourusername/wordpress-headless
  docker build -t yourusername/nextjs-frontend ./frontend
  docker push yourusername/nextjs-frontend
  ```
