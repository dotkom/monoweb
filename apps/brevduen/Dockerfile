FROM node:22-alpine@sha256:cb3143549582cc5f74f26f0992cdef4a422b22128cb517f94173a5f910fa4ee7 AS base

ARG SENTRY_RELEASE
ARG DOPPLER_ENVIRONMENT

FROM base AS builder
WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 turbo@2.0.14 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN turbo prune @dotkomonline/brevduen --docker

FROM base AS installer
WORKDIR /app

RUN npm install -g pnpm@10.15.1 turbo@2.0.14 --ignore-scripts
COPY --from=builder /app/out/full .
RUN pnpm install --ignore-scripts

RUN pnpm run -F @dotkomonline/emails build

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
RUN adduser --system --uid 1001 brevduen
USER brevduen

COPY --from=installer --chown=brevduen:nodejs --chmod=755 /app .
COPY --from=builder --chown=brevduen:nodejs --chmod=755 /app/out/full .

CMD node --loader ./apps/brevduen/runtime.mjs --experimental-strip-types ./apps/brevduen/src/index.ts
