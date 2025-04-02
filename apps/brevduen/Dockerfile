FROM node:22-alpine AS base

FROM base AS builder
WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@9.15.5 turbo@2.0.14 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN turbo prune @dotkomonline/brevduen --docker

FROM base AS installer
WORKDIR /app

ENV DOCKER_BUILD=1

RUN npm install -g pnpm@9.15.5 turbo@2.0.14 --ignore-scripts
COPY --from=builder /app/out/json .

RUN pnpm install --ignore-scripts
COPY --from=builder /app/out/full .

RUN pnpm run -F @dotkomonline/emails build

# Install for production
RUN pnpm install --production --ignore-scripts

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl

EXPOSE 3000

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 brevduen
USER brevduen

COPY --from=installer --chown=brevduen:nodejs --chmod=755 /app .
COPY --from=builder --chown=brevduen:nodejs --chmod=755 /app/out/full .

CMD node --loader ./apps/brevduen/runtime.mjs --experimental-strip-types ./apps/brevduen/src/index.ts
