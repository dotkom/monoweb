FROM public.ecr.aws/lambda/nodejs:20 AS builder

WORKDIR /usr/app
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

RUN npm i -g pnpm@9.15.5 --ignore-scripts
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm build:brevduen

FROM public.ecr.aws/lambda/nodejs:20 AS runner

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder --chmod=755 /usr/app/apps/brevduen/dist/* ./

CMD ["lambda.handler"]
