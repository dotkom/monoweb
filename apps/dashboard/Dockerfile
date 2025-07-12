FROM node:22-alpine@sha256:10962e8568729b0cfd506170c5a2d1918a2c10ac08c0e6900180b4bac061adc9 AS base

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
ARG RPC_HOST

ARG SENTRY_DSN
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_RELEASE

ARG DOPPLER_ENVIRONMENT

# Step 1: Build the Next.js application along with the necessary build variables.
FROM base AS builder
WORKDIR /app

COPY . .

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@9.15.5 --ignore-scripts
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
ENV RPC_HOST ${RPC_HOST}

# Allow Sentry to upload source maps and build artifacts during build.
ENV SENTRY_AUTH_TOKEN ${SENTRY_AUTH_TOKEN}

# The following are public build-time variables that instrument and configure Sentry
ENV SENTRY_DSN ${SENTRY_DSN}
ENV NEXT_PUBLIC_SENTRY_DSN ${SENTRY_DSN}
ENV SENTRY_RELEASE ${SENTRY_RELEASE}
ENV NEXT_PUBLIC_SENTRY_RELEASE ${SENTRY_RELEASE}
ENV DOPPLER_ENVIRONMENT ${DOPPLER_ENVIRONMENT}
ENV NEXT_PUBLIC_DOPPLER_ENVIRONMENT ${DOPPLER_ENVIRONMENT}

RUN pnpm run --filter @dotkomonline/dashboard build

# Step 2: Prepare the production image with the built application.
FROM base AS installer
WORKDIR /app

COPY . .

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@9.15.5 --ignore-scripts
RUN pnpm install --frozen-lockfile --ignore-scripts --production

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
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/dashboard/node_modules ./apps/dashboard/node_modules

COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/dashboard/.next ./apps/dashboard/.next
COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/dashboard/public ./apps/dashboard/public
COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/dashboard/package.json ./apps/dashboard/package.json

WORKDIR /app/apps/dashboard

CMD ["npm", "run", "start"]
