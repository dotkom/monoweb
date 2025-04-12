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
ARG NEXT_PUBLIC_RPC_HOST
ARG NEXT_PUBLIC_SENTRY_DSN
ARG SENTRY_DSN
ARG RPC_HOST

ARG DOPPLER_PROJECT
ARG DOPPLER_ENVIRONMENT
ARG DOPPLER_CONFIG

FROM base AS builder
WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@9.15.5 turbo@2.0.14 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN turbo prune @dotkomonline/dashboard --docker

FROM base AS installer
WORKDIR /app

RUN npm install -g pnpm@9.15.5 --ignore-scripts
COPY --from=builder /app/out/full .
RUN pnpm install --ignore-scripts

# Generate prisma types
WORKDIR /app/packages/db
RUN pnpm run generate
WORKDIR /app

ENV OAUTH_CLIENT_ID ${OAUTH_CLIENT_ID}
ENV OAUTH_CLIENT_SECRET ${OAUTH_CLIENT_SECRET}
ENV OAUTH_ISSUER ${OAUTH_ISSUER}
ENV AUTH_SECRET ${AUTH_SECRET}
ENV NEXT_PUBLIC_ORIGIN ${NEXT_PUBLIC_ORIGIN}
ENV NEXT_PUBLIC_RPC_HOST ${NEXT_PUBLIC_RPC_HOST}
ENV NEXT_PUBLIC_SENTRY_DSN ${NEXT_PUBLIC_SENTRY_DSN}
ENV SENTRY_DSN ${SENTRY_DSN}
ENV RPC_HOST ${RPC_HOST}

ENV DOPPLER_PROJECT ${DOPPLER_PROJECT}
ENV DOPPLER_ENVIRONMENT ${DOPPLER_ENVIRONMENT}
ENV DOPPLER_CONFIG ${DOPPLER_CONFIG}
ENV NEXT_PUBLIC_DOPPLER_PROJECT ${DOPPLER_PROJECT}
ENV NEXT_PUBLIC_DOPPLER_ENVIRONMENT ${DOPPLER_ENVIRONMENT}
ENV NEXT_PUBLIC_DOPPLER_CONFIG ${DOPPLER_CONFIG}

COPY --from=builder /app/out/full .
RUN pnpm run --filter @dotkomonline/dashboard build

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

COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/dashboard/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/dashboard/public ./apps/dashboard/public

CMD node apps/dashboard/server.js
