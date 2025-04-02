# Monoweb Developer Guide

This guide is intended for developers who want to contribute to Monoweb. It provides an overview of the project's
architecture, the tools used, and the local development process.

## Table of Contents

- [Monoweb Developer Guide](#monoweb-developer-guide)
  - [Table of Contents](#table-of-contents)
  - [Architecture](#architecture)
  - [Tools](#tools)
  - [Local Development](#local-development)
    - [Required Environment Variables](#required-environment-variables)
    - [What runs where?](#what-runs-where)
  - [Testing](#testing)
    - [Integration tests](#integration-tests)
      - [Prerequisites](#prerequisites)
      - [How to run](#how-to-run)

## Architecture

Monoweb is a monorepo that contains multiple libraries and applications. By application we mean a module or piece of
software that can be run independently. By library we mean a module, or a piece of software that is used by applications
or other libraries.

The monorepo is organized as follows:

- `packages/`: Contains all the libraries
- `apps/`: Contains all the applications
- `docs/`: Contains the documentation
- `tools/`: Internal developer tools, such as the Monoweb Shell CLI

We use [PNPM workspaces](https://pnpm.io/workspaces) along with [Turborepo](https://turbo.build/repo/docs) to manage the
monorepo. All dependencies for all libraries and applications are managed by PNPM.

All of the code in the Monorepo is TypeScript.

<details>
<summary>How are the libraries packaged and consumed?</summary>

You might wonder how we build the libraries so that the applications can consume them. The answer is that we don't. We
export the libraries as TypeScript source code, and consume them as TypeScript source code. In the default TypeScript
compiler, this would pose a problem, since the compiler does not want to enter `node_modules` directories.

However, since we use the Next.js Compiler for the web applications, and TSup for the other applications, we can tell
the Next.js Compiler or TSup compiler to bundle the libraries as part of the build process.

In Next.js, this is done by adding `transpilePackages` in the `next.config.mjs` files. In Tsup builds, we simply tell it
to bundle everything into a single file.

Examples of both can be found in the different applications in the `apps/` directory. For example, `apps/web` uses
Next.js, and `apps/brevduen` uses TSup.
</details>

## Tools

The following tools are used to develop Monoweb:

- [Node.js](https://nodejs.org/): JavaScript runtime
- [PNPM](https://pnpm.io/): Package manager (`npm i -g pnpm`)
- [Docker](https://www.docker.com/): Containerization for a few applications (not required `apps/web`)
- [Docker Compose](https://docs.docker.com/compose/): For using local PostgreSQL if wanted (modern versions of Docker
  include Docker Compose)
- [Doppler](https://doppler.com/): Secrets management, used for retrieving secrets in development.
    - If you are not a Dotkom team member, you will not have access to Doppler. You can still run the applications, but
      you will have to provide the secrets yourself. In this case, you can use a `.env` file in the different
      application directories, or export them into your shell.
- [AWS CLIv2](https://aws.amazon.com/cli/): Used for deploying to applications to AWS. You will need to have the correct
  AWS credentials set up to deploy to AWS. If you are not a dotkom team member, we can unfortunately not provide you
  with credentials.
- [Terraform](https://www.terraform.io/): Infrastructure as code, used for managing the infrastructure. Note that the
  Terraform configuration is located in a separate, private GitHub repository. If you are not a dotkom team member, we
  can unfortunately not provide you with access to the repository. This is done to prevent any confidential information
  from being leaked through [Atlantis](https://www.runatlantis.io/).

## Local Development

To get started with local development, ensure you have the [applicable tools](#tools) installed. To build and run all the
applications, you can use the following commands:

Terminal 1:
```bash
git clone https://github.com/dotkom/monoweb
cd monoweb

doppler login
doppler setup # Press Y on every prompt

docker compose up -d

pnpm install
pnpm migrate
pnpm dev
```

### Required Environment Variables

These are the environment variables that are required to run the applications. Below is a template that you can copy if
you do not have access to Doppler:

Please consult the example [.env.example](.env.example) file for the environment variables necessary.

### What runs where?

The following applications run on the following ports:

- `/apps/web`: 3000
- `/apps/dashboard`: 3002
- `/apps/rif`: 3003
- `/apps/invoicing`: 3004
- `/apps/brevduen`: AWS Lambda only
- `/packages/ui`: 61000 (ladle)

## Testing

### Integration tests

Config file: `packages/core/vitest-integration.config.ts`
Setup functions: `packages/core/vitest-integration.setup.ts`

#### Prerequisites

- Docker

Monoweb uses test containers to run a PostgreSQL database in Docker for testing.
#### How to run

```bash
cd packages/core
doppler run -- pnpm exec vitest run -c ./vitest-integration.config.ts
```

**Note:** The `DATABASE_URL` environment variable is overwritten in the setup file to use the test container database.

**Filtering**

For filtering test you can use the normal vitest filtering, see [Vitest documentation](https://vitest.dev/guide/filtering).

*Example: run a spesific test*

```bash
cd packages/core
doppler run -- pnpm exec vitest run -c ./vitest-integration.config.ts user -t "can update users given their id"
```
