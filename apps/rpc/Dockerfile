FROM node:22-alpine@sha256:9385cd9f3001dfc3431e8ead12c43e9e1f87cc1b9b5c6cfd0f73865d405b27c4 AS base
FROM base AS installer
WORKDIR /app

RUN npm install -g pnpm@10.15.1 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --ignore-scripts

# Install for production
RUN pnpm install --prod --ignore-scripts --config.confirmModulesPurge=false

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl

EXPOSE 3000

ENV NODE_ENV=production

# Embed the Sentry release ID into the container.
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=${SENTRY_RELEASE}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 rpc
USER rpc

COPY --from=installer --chown=rpc:nodejs --chmod=755 /app .

CMD ["node", "--loader", "./apps/rpc/runtime.mjs", "--experimental-strip-types", "./apps/rpc/src/bin/server.ts"]
