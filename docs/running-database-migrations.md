# Running database migrations

This document describes how to run the migrations for local or remote databases.

The process is slightly different for the remote `staging` and `production`
databases, because you credentials which are stored in Doppler.

## Running migrations for Local Development

- You have a local database running. To keep consistency with the other
  environments, you should use the docker compose. `docker compose up -d` will
  start a local postgres instance.
- You have the credentials for said local database.

```bash
# If using the docker compose, these are the credentials used.
export DATABASE_URL="postgres://ow:owpassword123@localhost:5432/ow"

pnpm migrate:dev
pnpm migrate:dev-with-fixtures
```

## Running migrations for Production or Staging

- Database credentials for the database in question. These are stored in Doppler
  if you are a Dotkom member. If you're not a member, you will have to wait for
  someone to do it.

```bash
export AWS_RDS_CERTIFICATE_AUTHORITY=$(cat "path/to/eu-north-1-bundle.pem")
export DATABASE_URL="postgres://..."

pnpm migrate:deploy
pnpm migrate:deploy-with-fixtures
```

[aws-rds-ca]: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html#UsingWithRDS.SSL.CertificatesAllRegions