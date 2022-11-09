# galactic-thunderdome-x

https://owdocs.vercel.app

## Development

1. `yarn` to install packages
2. `yarn build` to build packages
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
6. `yarn dev` to run the project
   - You can run `yarn dev --filter=<project>` to run a certain project from root, such as `yarn dev --filter=web`
