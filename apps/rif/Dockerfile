FROM node:22-alpine@sha256:10962e8568729b0cfd506170c5a2d1918a2c10ac08c0e6900180b4bac061adc9 AS base

FROM base AS builder
WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@9.15.5 turbo@2.0.14 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN turbo prune @dotkomonline/rif --docker

FROM base AS installer
WORKDIR /app

RUN npm install -g pnpm@9.15.5 turbo@2.0.14 --ignore-scripts
COPY --from=builder /app/out/full .
RUN pnpm install --ignore-scripts
RUN turbo run build --filter @dotkomonline/rif

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

COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/rif/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/rif/.next/static ./apps/rif/.next/static
COPY --from=installer --chown=nextjs:nodejs --chmod=755 /app/apps/rif/public ./apps/rif/public

CMD node apps/rif/server.js
