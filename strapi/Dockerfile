# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json ./
COPY yarn.lock* ./ 

# Install dependencies
RUN yarn install --network-timeout 100000

# Copy source code
COPY . .

# Build Strapi
RUN yarn build

# Final stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 101 -S strapi && \
    adduser -S -D -H -u 101 -h /app -s /sbin/nologin -G strapi -g strapi strapi

# Copy from builder
COPY --from=builder --chown=strapi:strapi /app/dist ./dist
COPY --from=builder --chown=strapi:strapi /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /app/package.json ./package.json
COPY --from=builder --chown=strapi:strapi /app/public ./public
COPY --from=builder --chown=strapi:strapi /app/types ./types
COPY --from=builder --chown=strapi:strapi /app/.strapi ./.strapi
COPY --from=builder --chown=strapi:strapi /app/config ./config
COPY --from=builder --chown=strapi:strapi /app/database ./database

# Switch to non-root user
USER strapi

# Expose Strapi port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:1337/admin', (r) => {if (r.statusCode !== 200) throw new Error('Health check failed')})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Strapi
CMD ["node", "dist/server.js"]
