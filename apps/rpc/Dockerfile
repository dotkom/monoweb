FROM node:22-alpine@sha256:1b2479dd35a99687d6638f5976fd235e26c5b37e8122f786fcd5fe231d63de5b AS base

FROM base AS installer
WORKDIR /app

COPY apps ./apps
COPY packages ./packages
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

RUN npm install -g pnpm@10.15.1 --ignore-scripts
RUN pnpm install --ignore-scripts
RUN pnpm generate

# Install for production
RUN pnpm deploy --prod --no-optional -F @dotkomonline/rpc /opt/rpc

FROM base AS runner
WORKDIR /opt/rpc

RUN apk add --no-cache curl

EXPOSE 3000

ENV NODE_ENV=production

# Embed the Sentry release ID into the container.
ENV SENTRY_RELEASE=${SENTRY_RELEASE}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 rpc
USER rpc

COPY --from=installer --chown=rpc:nodejs --chmod=755 /opt/rpc .

CMD node --import="amaro/strip" --experimental-strip-types --enable-source-maps ./src/bin/server.ts
