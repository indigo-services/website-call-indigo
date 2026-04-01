# Force cache invalidate - v3 - final fix
FROM node:22-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    pkg-config \
    sqlite3 \
    tini \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Enable yarn and install dependencies
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Install dependencies with proper flags
RUN yarn install --network-timeout 100000 --ignore-engines --ignore-scripts

# Copy application files
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337
ENV DATABASE_CLIENT=sqlite
ENV DATABASE_FILENAME=.tmp/data.db

# Build the application
RUN yarn build

# Create necessary directories and set permissions
RUN mkdir -p /app/.tmp /app/public/uploads /app/node_modules/.cache \
  && chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 1337

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1337/', (r) => {process.exit(r.statusCode === 200 || r.statusCode === 302 ? 0 : 1)})" || exit 1

# Set entrypoint and command
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
