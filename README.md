# galactic-thunderdome-x

https://owdocs.vercel.app

<a href="https://vercel.com?utm_source=[team-name]&utm_campaign=oss" width="150" height="30">
    <img src="https://images.ctfassets.net/e5382hct74si/78Olo8EZRdUlcDUFQvnzG7/fa4cdb6dc04c40fceac194134788a0e2/1618983297-powered-by-vercel.svg" alt="Vercel">
</a>

## Development  

1. `pnpm i` to install packages
2. `pnpm build` to build packages
3. `docker-compose up` to start databases
4. The command will output a client id, set this in apps/web/.env. Copy the example from .env.example
5. `pnpm dev` to run the project
   - You can run `pnpm dev --filter=<project>` to run a certain project from root, such as `pnpm dev --filter=web`

## Environment Setup

The project requires environment variables to run locally. All variables are validated using the env package (located at packages/env/src/env.mjs).

### Internal Tooling

Internally we use Doppler for our secrets management. Send a message to someone in Dotkom or send a mail to `dotkom@online.ntnu.no` if you believe you should have access.

#### Doppler CLI Setup

1. Install Doppler CLI: Follow the instructions at [Doppler CLI Documentation](https://docs.doppler.com/docs/install-cli)
2. Authenticate: Run `doppler login`
3. Configure environment using `doppler setup`

#### Environment Selection

Our setup includes two environments: dev (development) and prd (production).

Use `doppler setup` to choose your environment.

**Important note**: The dev environment connects to a shared database. To avoid annoying other devs using this databsae, avoid performing migrations or changing too much data on this database. Set up your own database instance for such operations:

#### Running with the Shared Database

If you choose to use the shared database in the dev environment:

Run this in the root of the repo:
`doppler run -- pnpm run dev`

This approach is suitable for general development and testing where database modifications are not required.

#### Running the Project with your own database

```sh
export DATABASE_URL="postgres://<username>:<password>@0.0.0.0:5432/<db_name>"
doppler run --preserve-env pnpm dev
```

### Local Database Setup

The project uses pgx ulid PostgreSQL extension for ULID support. This needs to be installed in your local database.  For convenience, you can use the docker image: public.ecr.aws/z5h0l8j6/dotkom/pgx-ulid:0.1.3 that includes the necessary extension pre installed.

### [Auth0] How to sync user pool with OW

This should not be necessary, as we now create a monoweb user when a user from Auth0 first logs in.

1. Install Auth0 CLI
2. Log into Auth0 with `auth0 login`
3. Install PostGreSQL Client (for debian/ubuntu-based: `sudo apt install postgresql-client-14` (or later versions))
4. Install jq `sudo apt install jq`
5. Load the database into the shell. (`export DATABASE_URL=$(doppler secrets get DATABASE_URL --plain)`)
6. Run the command below to sync.

```shell
# you actually need to paginate...
auth0 api users \
  | jq ".[].user_id"
  | xargs -I '{}' \
  psql -Atx $DATABASE_URL -c "INSERT INTO ow_user (auth0_sub) VALUES ('{}') ON CONFLICT DO NOTHING"
```

### [Payment] How to configure stripe (locally)

If you want the payment system to work while running monoweb locally, you will have to follow these steps:

1. Navigate to [this link](https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local) and follow instruction (1) on the page
2. Follow instruction (2) on the page BUT replace the url in the command with `localhost:3000/api/webhooks/stripe/{public_key}` where {public_key} is your stripe public key
3. Replace the appropriate webhook secret env variable in .env with the one given by the CLI in the console
4. Start monoweb with `pnpm dev`
5. Follow step(3) on the page. This will finish registering your local system as a webhook receipient
6. Finally, when all steps are finished, click "done"

If you have multiple stripe accounts configured like monoweb has right now, you might want to do this on every account. If not then just make sure that you are using the configured stripe account when you are creating checkout sessions.

That should be it :)