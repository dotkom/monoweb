# Monoweb Developer Guide

This guide is intended for developers who want to contribute to Monoweb. It provides an overview of the project's
architecture, the tools used, and the local development process.

## Table of Contents

- [Architecture](#architecture)
- [Tools](#tools)
- [Local Development](#local-development)
    - [Required Environment Variables](#required-environment-variables)
    - [Running with your own PostgreSQL database](#running-with-your-own-postgresql-database)

## Architecture

Monoweb is a monorepo that contains multiple libraries and applications. By application we mean a module or piece of
software that can be run independently. By library we mean a module, or a piece of software that is used by applications
or other libraries.

The monorepo is organized as follows:

- `packages/`: Contains all the libraries
- `apps/`: Contains all the applications
- `docs/`: Contains the documentation
- `tools/`: Internal developer tools, such as the Monoweb Database Migrator

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
Next.js, and `apps/gateway-email` uses TSup.
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

```bash
doppler login
doppler setup --project monoweb --config dev

git clone https://github.com/dotkom/monoweb
cd monoweb

pnpm install
doppler run pnpm dev
```

> Note that this, by default, uses a shared database hosted on https://neon.tech. Because this database is shared, you
> should be careful with what you do with it. If you need to perform migrations or change data, you should set up your
> branch on Neon. See the [guide for using Neon like a pro](./using-neon-like-a-pro.md) for more information.

If you want to run a specific application, you can use the `--filter` flag:

```bash
doppler run pnpm dev --filter=@dotkomonline/web
```

If you have some local variables that you want to use, and override the Doppler ones you can use the `--preserve-env`
flag:

```bash
export DATABASE_URL="postgres://<username>:<password>@localhost:5432/<db_name>"
doppler run --preserve-env pnpm dev
```

If you are not using Doppler, you need to use a standalone `.env` file placed in the project root. For how to populate the `.env` file, see [this chapter](#required-environment-variables). For how to start local development, follow the rest of the chapter where you omit the use of Doppler:

```diff
- doppler run pnpm dev
+ pnpm dev
```

### Required Environment Variables

These are the environment variables that are required to run the applications. Below is a template that you can copy if
you do not have access to Doppler:

Please consult the example [.env.example](.env.example) file for the environment variables necessary.

### Running with your own PostgreSQL database

> This section requires you to have both [Docker](#tools) and [Docker Compose](#tools) installed.

We use PostgreSQL 15 with the `pgx_ulid` extension. You can use the `packages/pgx-ulid` package to build the extension
into a Docker image, and then run the image to get a PostgreSQL instance with the extension.

```bash
cd packages/pgx-ulid
sh build.sh

# You now have a Docker image named pgx_ulid:0.1.3
```

If you don't want to manually build the image (it takes a while, and is error prone), you can use Dotkom's publicly
distributed image. The image is available at `https://gallery.ecr.aws/dotkom/dotkom/pgx-ulid`.

```bash
docker run -d -p 5432:5432 public.ecr.aws/dotkom/dotkom/pgx-ulid \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=postgres
  
# Set your DATABASE_URL to the following:
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres"
```
