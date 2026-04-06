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

COPY strapi/package.json strapi/yarn.lock strapi/.yarnrc.yml ./
COPY strapi/scripts ./scripts

RUN corepack enable \
  && corepack prepare yarn@4.13.0 --activate \
  && yarn install --immutable

FROM deps AS build

COPY strapi/. .

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

RUN mkdir -p /app/.tmp /app/public/uploads \
  && chown -R node:node /app

USER node

EXPOSE 1337

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
