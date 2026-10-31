# syntax=docker/dockerfile:1@sha256:4edf897a3ffa55b89f906fc8cc78afdb3f1834cc9c7083565e611a8a7d5fe99e

FROM node:22-alpine@sha256:1b2479dd35a99687d6638f5976fd235e26c5b37e8122f786fcd5fe231d63de5b AS base

# Next.js evaluates a lot of code at build-time for things like SSG and SSR. For this reason, we need some of the
# runtime variables to be available at build-time.
#
# Only non-secret configuration uses build arguments. Credentials are mounted for the build command below.
ARG AUTH0_CLIENT_ID
ARG AUTH0_ISSUER
ARG AUTH0_AUDIENCES
ARG NEXT_PUBLIC_ORIGIN
ARG NEXT_PUBLIC_RPC_HOST
ARG NEXT_PUBLIC_HOME_URL
ARG RPC_HOST
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY

ARG SENTRY_DSN
ARG SENTRY_RELEASE

ARG DOPPLER_ENVIRONMENT

# Step 1: Build the Next.js application along with the necessary build variables.
FROM base AS builder
WORKDIR /app

COPY . .

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 --ignore-scripts
RUN pnpm install --frozen-lockfile --ignore-scripts

ENV AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}
ENV AUTH0_ISSUER=${AUTH0_ISSUER}
ENV AUTH0_AUDIENCES=${AUTH0_AUDIENCES}
ENV NEXT_PUBLIC_ORIGIN=${NEXT_PUBLIC_ORIGIN}
ENV NEXT_PUBLIC_RPC_HOST=${NEXT_PUBLIC_RPC_HOST}
ENV NEXT_PUBLIC_HOME_URL=${NEXT_PUBLIC_HOME_URL}
ENV RPC_HOST=${RPC_HOST}

# The following are public build-time variables that instrument and configure Sentry
ENV SENTRY_DSN=${SENTRY_DSN}
ENV NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}
ENV SENTRY_RELEASE=${SENTRY_RELEASE}
ENV NEXT_PUBLIC_SENTRY_RELEASE=${SENTRY_RELEASE}
ENV DOPPLER_ENVIRONMENT=${DOPPLER_ENVIRONMENT}
ENV NEXT_PUBLIC_DOPPLER_ENVIRONMENT=${DOPPLER_ENVIRONMENT}

# Credentials are only available to this command and are not stored in image metadata or layers.
RUN --mount=type=secret,id=AUTH0_CLIENT_SECRET,env=AUTH0_CLIENT_SECRET,required=true \
    --mount=type=secret,id=AUTH_SECRET,env=AUTH_SECRET,required=true \
    --mount=type=secret,id=SIGNING_KEY,env=SIGNING_KEY,required=true \
    --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
    pnpm run --filter @dotkomonline/web build

# Step 2: Only install the necessary dependencies for the production build of this application.
FROM base AS installer
WORKDIR /app

COPY . .

# First, we install the prerequisites to build the Prisma client.
RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 --ignore-scripts
RUN pnpm install --frozen-lockfile --ignore-scripts

# We can now install the actual production dependencies.
RUN pnpm install --frozen-lockfile --ignore-scripts --prod --config.confirmModulesPurge=false

# Step 3: Run the actual application and finalize the image.
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Embed the Sentry release ID into the container.
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=${SENTRY_RELEASE}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/node_modules ./node_modules
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/web/node_modules ./apps/web/node_modules

COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/web/package.json ./apps/web/package.json

WORKDIR /app/apps/web

CMD ["npm", "run", "start"]
