FROM public.ecr.aws/lambda/nodejs:18 AS builder

WORKDIR /usr/app
COPY apps ./apps
COPY packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json turbo.json ./

RUN npm i -g pnpm@8
RUN pnpm install --frozen-lockfile
RUN pnpm build:batman

# check that the build was successful by listing out the contents of the dist folder
RUN ls -la /usr/app/apps/batman/dist

FROM public.ecr.aws/lambda/nodejs:18 AS runner

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /usr/app/apps/batman/dist/* ./

CMD ["lambda.handler"]
