# galactic-thunderdome-x

https://owdocs.vercel.app

## Development

1. `pnpm i` to install packages
2. `pnpm build` to build packages
3. `docker-compose up` to start Hydra and databases
4. If you want authentication (optional), run:

```
docker exec hydra hydra create --endpoint http://127.0.0.1:4445 oauth2-client \
        --name onlineweb \
        --client-uri onlineweb \
        --token-endpoint-auth-method none \
        --grant-type authorization_code,refresh_token \
        --response-type code \
        --scope profile,email,openid \
        --redirect-uri http://localhost:3000/api/auth/callback/onlineweb
```

5. The command will output a client id, set this in apps/web/.env. Copy the example from .env.example
6. `pnpm dev` to run the project
   - You can run `pnpm dev --filter=<project>` to run a certain project from root, such as `pnpm dev --filter=web`


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
