FROM node:22-alpine@sha256:dbcedd8aeab47fbc0f4dd4bffa55b7c3c729a707875968d467aaaea42d6225af AS base

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

ARG SENTRY_DSN
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_RELEASE

ARG DOPPLER_ENVIRONMENT

# Step 1: Build the Next.js application along with the necessary build variables.
FROM base AS builder
WORKDIR /app

COPY . .

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 --ignore-scripts
RUN pnpm install --frozen-lockfile --ignore-scripts

WORKDIR /app/packages/db
RUN pnpm run generate
WORKDIR /app

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

# Allow Sentry to upload source maps and build artifacts during build.
ENV SENTRY_AUTH_TOKEN ${SENTRY_AUTH_TOKEN}

# The following are public build-time variables that instrument and configure Sentry
ENV SENTRY_DSN ${SENTRY_DSN}
ENV NEXT_PUBLIC_SENTRY_DSN ${SENTRY_DSN}
ENV SENTRY_RELEASE ${SENTRY_RELEASE}
ENV NEXT_PUBLIC_SENTRY_RELEASE ${SENTRY_RELEASE}
ENV DOPPLER_ENVIRONMENT ${DOPPLER_ENVIRONMENT}
ENV NEXT_PUBLIC_DOPPLER_ENVIRONMENT ${DOPPLER_ENVIRONMENT}

RUN pnpm run --filter @dotkomonline/web build

# Step 2: Only install the necessary dependencies for the production build of this application.
FROM base AS installer
WORKDIR /app

COPY . .

# First, we install the prerequisites to build the Prisma client.
RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 --ignore-scripts
RUN pnpm install --frozen-lockfile --ignore-scripts

# Ensure the Prisma .prisma/client/default directory is generated at the monorepo root.
WORKDIR /app/packages/db
RUN pnpm run generate
WORKDIR /app

# We can now install the actual production dependencies.
RUN pnpm install --frozen-lockfile --ignore-scripts --prod

# Step 3: Run the actual application and finalize the image.
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Embed the Sentry release ID into the container.
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
