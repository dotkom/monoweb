FROM node:22-alpine@sha256:1b2479dd35a99687d6638f5976fd235e26c5b37e8122f786fcd5fe231d63de5b AS base

# Next.js evaluates a lot of code at build-time for things like SSG and SSR. For this reason, we need some of the
# runtime variables to be available at build-time.
#
# These build arguments loosely mirror the src/env.ts file
ARG NEXT_PUBLIC_ORIGIN
ARG NEXT_PUBLIC_BACKEND_HOST
ARG NEXT_PUBLIC_HOME_URL
ARG BACKEND_HOST

ARG DOPPLER_ENVIRONMENT

# Step 1: Build the Next.js application along with the necessary build variables.
FROM base AS builder
WORKDIR /app

COPY . .

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 --ignore-scripts
RUN pnpm install --frozen-lockfile --ignore-scripts

WORKDIR /app/packages/grades-db
RUN pnpm run generate:grades
WORKDIR /app

ENV NEXT_PUBLIC_ORIGIN ${NEXT_PUBLIC_ORIGIN}
ENV NEXT_PUBLIC_BACKEND_HOST ${NEXT_PUBLIC_BACKEND_HOST}
ENV NEXT_PUBLIC_HOME_URL ${NEXT_PUBLIC_HOME_URL}
ENV BACKEND_HOST ${BACKEND_HOST}

RUN pnpm run --filter @dotkomonline/grades-frontend build

# Step 2: Only install the necessary dependencies for the production build of this application.
FROM base AS installer
WORKDIR /app

COPY . .

# First, we install the prerequisites to build the Prisma client.
RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 --ignore-scripts
RUN pnpm install --frozen-lockfile --ignore-scripts

# Ensure the Prisma .prisma/client/default directory is generated at the monorepo root.
WORKDIR /app/packages/grades-db
RUN pnpm run generate:grades
WORKDIR /app

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

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/node_modules ./node_modules
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/grades-frontend/node_modules ./apps/grades-frontend/node_modules

COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/grades-frontend/.next ./apps/grades-frontend/.next
COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/grades-frontend/public ./apps/grades-frontend/public
COPY --from=builder --chown=nextjs:nodejs --chmod=755 /app/apps/grades-frontend/package.json ./apps/grades-frontend/package.json

WORKDIR /app/apps/grades-frontend

CMD ["npm", "run", "start"]
