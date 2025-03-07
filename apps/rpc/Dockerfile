FROM node:22-alpine AS base

FROM base AS builder
WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@9.15.7 turbo@2.0.14 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN turbo prune @dotkomonline/rpc --docker

FROM base AS installer
WORKDIR /app

ENV DOCKER_BUILD=1

RUN npm install -g pnpm@9.15.7 turbo@2.0.14 --ignore-scripts
COPY --from=builder /app/out/json .
COPY --from=builder /app/out/full/packages/db/prisma/schema.prisma packages/db/prisma/schema.prisma

# Must enable scripts here for Prisma codegen to build
RUN apk update && apk add --no-cache python3 gcc g++ make
RUN pnpm install

# Install for production
RUN pnpm install --production

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl

EXPOSE 3000

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 rpc
USER rpc

COPY --from=installer --chown=rpc:nodejs --chmod=755 /app .
COPY --from=builder --chown=rpc:nodejs --chmod=755 /app/out/full .

CMD node --loader ./apps/rpc/runtime.mjs --experimental-strip-types ./apps/rpc/src/index.ts
