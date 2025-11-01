FROM node:22-alpine@sha256:b2358485e3e33bc3a33114d2b1bdb18cdbe4df01bd2b257198eb51beb1f026c5 AS base

FROM base AS installer
WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.15.1 --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --ignore-scripts
RUN pnpm run -r --filter @dotkomonline/rif build

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
