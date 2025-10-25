FROM node:22-alpine@sha256:bd26af08779f746650d95a2e4d653b0fd3c8030c44284b6b98d701c9b5eb66b9 AS base
FROM base AS installer
WORKDIR /app

RUN npm install -g pnpm@10.15.1 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --ignore-scripts
RUN pnpm generate

# Install for production
RUN pnpm install --prod --ignore-scripts

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl

EXPOSE 3000

ENV NODE_ENV=production

# Embed the Sentry release ID into the container.
ENV SENTRY_RELEASE=${SENTRY_RELEASE}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 rpc
USER rpc

COPY --from=installer --chown=rpc:nodejs --chmod=755 /app .

CMD node --loader ./apps/rpc/runtime.mjs --experimental-strip-types ./apps/rpc/src/bin/server.ts
