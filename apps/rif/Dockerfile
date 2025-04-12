FROM node:22-alpine AS base

ARG NEXT_PUBLIC_SENTRY_DSN
ARG EMAIL_ENDPOINT
ARG EMAIL_TOKEN
ARG SERVICE_ACCOUNT
ARG SPREADSHEET_ID
ARG SENTRY_DSN

ARG DOPPLER_PROJECT
ARG DOPPLER_ENVIRONMENT
ARG DOPPLER_CONFIG

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

ENV NEXT_PUBLIC_SENTRY_DSN ${NEXT_PUBLIC_SENTRY_DSN}
ENV EMAIL_ENDPOINT ${EMAIL_ENDPOINT}
ENV EMAIL_TOKEN ${EMAIL_TOKEN}
ENV SERVICE_ACCOUNT ${SERVICE_ACCOUNT}
ENV SPREADSHEET_ID ${SPREADSHEET_ID}
ENV SENTRY_DSN ${NEXT_PUBLIC_SENTRY_DSN}

ENV DOPPLER_PROJECT ${DOPPLER_PROJECT}
ENV DOPPLER_ENVIRONMENT ${DOPPLER_ENVIRONMENT}
ENV DOPPLER_CONFIG ${DOPPLER_CONFIG}
ENV NEXT_PUBLIC_DOPPLER_PROJECT ${DOPPLER_PROJECT}
ENV NEXT_PUBLIC_DOPPLER_ENVIRONMENT ${DOPPLER_ENVIRONMENT}
ENV NEXT_PUBLIC_DOPPLER_CONFIG ${DOPPLER_CONFIG}

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
