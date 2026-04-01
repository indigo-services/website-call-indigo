FROM node:22-bookworm-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    pkg-config \
    sqlite3 \
    tini \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS deps

COPY package.json yarn.lock ./

RUN corepack enable \
  && corepack prepare yarn@1.22.22 --activate \
  && yarn install --network-timeout 100000 --ignore-engines --ignore-scripts

FROM deps AS build

COPY . .

ENV NODE_ENV=production

RUN yarn build

FROM node:22-bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    tini \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337
ENV DATABASE_CLIENT=sqlite
ENV DATABASE_FILENAME=.tmp/data.db

WORKDIR /app

COPY --from=build /app /app

RUN mkdir -p /app/.tmp /app/public/uploads /app/node_modules/.cache \
  && chown -R node:node /app

USER node

EXPOSE 1337

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1337/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
