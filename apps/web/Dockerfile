FROM node:22-alpine AS base

# Next.js evaluates a lot of code at build-time for things like SSG and SSR. For this reason, we need some of the
# runtime variables to be available at build-time.
#
# These build arguments loosely mirror the src/env.ts file
ARG OAUTH_CLIENT_ID
ARG OAUTH_CLIENT_SECRET
ARG OAUTH_ISSUER
ARG AUTH_SECRET
ARG NEXT_PUBLIC_ORIGIN
ARG RPC_HOST

FROM base AS builder
WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@9.15.5 turbo@2.0.14 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN turbo prune @dotkomonline/web --docker

FROM base AS installer
WORKDIR /app

ENV DOCKER_BUILD=1

RUN npm install -g pnpm@9.15.5 turbo@2.0.14 --ignore-scripts
COPY --from=builder /app/out/json .
COPY --from=builder /app/out/full/packages/db/prisma/schema.prisma packages/db/prisma/schema.prisma
RUN pnpm install --ignore-scripts

# Generate prisma types
WORKDIR /app/packages/db
RUN pnpm run generate
WORKDIR /app

COPY --from=builder /app/out/full .

ENV OAUTH_CLIENT_ID ${OAUTH_CLIENT_ID}
ENV OAUTH_CLIENT_SECRET ${OAUTH_CLIENT_SECRET}
ENV OAUTH_ISSUER ${OAUTH_ISSUER}
ENV AUTH_SECRET ${AUTH_SECRET}
ENV NEXT_PUBLIC_ORIGIN ${NEXT_PUBLIC_ORIGIN}
ENV RPC_HOST ${RPC_HOST}

RUN turbo run build --filter @dotkomonline/web

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/web/public ./apps/web/public

CMD node apps/web/server.js
