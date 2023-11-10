FROM public.ecr.aws/lambda/nodejs:18@sha256:d8c85eaf7b6d2d093f3f39f0548e394f395681b25691ad9861b5462aeb123156 AS builder

WORKDIR /usr/app
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json turbo.json ./

RUN npm i -g pnpm@8
RUN pnpm install --frozen-lockfile
RUN pnpm build:dispatcher-auth

FROM public.ecr.aws/lambda/nodejs:18@sha256:d8c85eaf7b6d2d093f3f39f0548e394f395681b25691ad9861b5462aeb123156 AS runner

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /usr/app/apps/dispatcher-auth/dist/* ./

CMD ["lambda.handler"]
