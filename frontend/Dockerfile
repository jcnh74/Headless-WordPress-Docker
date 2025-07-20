# Use the official Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build dependencies for native modules (if any)
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  && npm install -g npm@11.4.2

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev --no-audit --no-fund

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run docker:build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]