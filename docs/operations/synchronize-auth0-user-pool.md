# How to sync Auth0 user pool with Monoweb

This should not be necessary, as we now create a monoweb user when a user from Auth0 first logs in.

1. Install Auth0 CLI
2. Log into Auth0 with `auth0 login`
3. Install PostGreSQL Client (for debian/ubuntu-based: `sudo apt install postgresql-client-15` (or later versions))
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