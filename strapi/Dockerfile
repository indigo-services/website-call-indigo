# Force cache invalidate - v3 - final fix
FROM node:22-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    libpng-dev \
    make \
    g++ \
    pkg-config \
    sqlite3 \
    tini \
    gcc \
    build-base \
    automake \
    zlib-dev \
    autoconfig \

  && rm -rf /var/lib/apt/lists/*     

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Enable yarn and install dependencies
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Install dependencies with proper flags (but don't ignore scripts for native modules)
RUN yarn install --network-timeout 100000 --ignore-engines

# Copy application files
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337
ENV DATABASE_CLIENT=sqlite
ENV DATABASE_FILENAME=.tmp/data.db

# Set security keys using your actual secrets
ENV APP_KEYS=d3800189_ad55_41bf_a330_0e326d6873781,ae374b7b_2d06_4c99_9be0_08d6c0ed34622
ENV API_TOKEN_SALT=63a1c48c_c951_4bfe_831a_f34009a317c3
ENV ADMIN_JWT_SECRET=05130689_2be1_46cc_ad3b_ae1d02798660
ENV TRANSFER_TOKEN_SALT=bbd36f19_e683_47cb_a477_acce1c4531c8
ENV JWT_SECRET=00df0dde_c4b6_412a_a239_c65963c7e02a
ENV ADMIN_AUTH_SECRET=05130689_2be1_46cc_ad3b_ae1d02798660
ENV ADMIN_PATH=/manage/admin

# Build the application
RUN yarn build

# Rebuild better-sqlite3 native module for current architecture
RUN yarn rebuild better-sqlite3 || (cd node_modules/better-sqlite3 && npm run build-release)

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
