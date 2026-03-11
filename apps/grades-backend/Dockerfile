FROM node:22-alpine@sha256:1b2479dd35a99687d6638f5976fd235e26c5b37e8122f786fcd5fe231d63de5b AS base
FROM base AS installer
WORKDIR /app

RUN npm install -g pnpm@10.15.1 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --ignore-scripts
RUN pnpm generate:grades

# Install for production
RUN pnpm install --prod --ignore-scripts --config.confirmModulesPurge=false

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl

EXPOSE 3000

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 grades-backend
USER grades-backend

COPY --from=installer --chown=grades-backend:nodejs --chmod=755 /app .

CMD node --loader ./apps/grades-backend/runtime.mjs --experimental-strip-types ./apps/grades-backend/src/bin/server.ts
