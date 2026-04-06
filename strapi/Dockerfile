FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    pkg-config \
    sqlite3 \
    libsqlite3-dev \
    libpng-dev \
    tini \
    autoconf \
    automake \
    libtool \
    zlib1g-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./
COPY scripts ./scripts

RUN corepack enable && corepack prepare yarn@4.13.0 --activate
RUN yarn install --immutable

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337
ENV ADMIN_PATH=/manage/admin

RUN yarn build
RUN yarn rebuild better-sqlite3 || (cd node_modules/better-sqlite3 && npm run build-release)

RUN mkdir -p /app/.tmp /app/public/uploads /app/node_modules/.cache \
  && chown -R node:node /app

USER node

EXPOSE 1337

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1337/', (r) => {process.exit(r.statusCode === 200 || r.statusCode === 302 ? 0 : 1)})" || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
