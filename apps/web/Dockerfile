FROM node:22-alpine AS base

# Next.js evaluates a lot of code at build-time for things like SSG and SSR. For this reason, we need some of the
# runtime variables to be available at build-time.
#
# These build arguments loosely mirror the src/env.ts file
ARG AUTH0_CLIENT_ID
ARG AUTH0_CLIENT_SECRET
ARG AUTH0_ISSUER
ARG AUTH0_AUDIENCES
ARG AUTH_SECRET
ARG NEXT_PUBLIC_ORIGIN
ARG NEXT_PUBLIC_RPC_HOST
ARG NEXT_PUBLIC_DASHBOARD_URL
ARG NEXT_PUBLIC_HOME_URL
ARG RPC_HOST
ARG SIGNING_KEY

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

RUN npm install -g pnpm@9.15.5 --ignore-scripts
COPY --from=builder /app/out/full .
RUN pnpm install --ignore-scripts

# Generate prisma types
WORKDIR /app/packages/db
RUN pnpm run generate
WORKDIR /app

COPY --from=builder /app/out/full .

ENV AUTH0_CLIENT_ID ${AUTH0_CLIENT_ID}
ENV AUTH0_CLIENT_SECRET ${AUTH0_CLIENT_SECRET}
ENV AUTH0_ISSUER ${AUTH0_ISSUER}
ENV AUTH0_AUDIENCES ${AUTH0_AUDIENCES}
ENV AUTH_SECRET ${AUTH_SECRET}
ENV NEXT_PUBLIC_ORIGIN ${NEXT_PUBLIC_ORIGIN}
ENV NEXT_PUBLIC_RPC_HOST ${NEXT_PUBLIC_RPC_HOST}
ENV NEXT_PUBLIC_DASHBOARD_URL ${NEXT_PUBLIC_DASHBOARD_URL}
ENV NEXT_PUBLIC_HOME_URL ${NEXT_PUBLIC_HOME_URL}
ENV RPC_HOST ${RPC_HOST}
ENV SIGNING_KEY ${SIGNING_KEY}

RUN pnpm run --filter @dotkomonline/web build

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
