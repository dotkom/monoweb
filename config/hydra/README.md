```
CALLBACK_URL=http://localhost:3000/api/auth/callback/onlineweb
SCOPES=openid,email,profile
```

## Create an openid client

```
docker-compose exec hydra hydra clients create \
        --endpoint http://127.0.0.1:4445 \
        --id ow-client \
        --name Onlineweb \
        --token-endpoint-auth-method none \
        --grant-types authorization_code,refresh_token \
        --response-types code \
        --scope profile,email,openid \
        --callbacks http://localhost:3000/api/auth/callback/onlineweb
```

```
docker exec f28ba hydra create oauth2-client --endpoint http://127.0.0.1:4445 \
        --name Onlineweb \
```

```
docker exec f28 hydra create --endpoint http://127.0.0.1:4445 oauth2-client \
        --name onlineweb \
        --client-uri onlineweb \
        --token-endpoint-auth-method none \
        --grant-type authorization_code,refresh_token \
        --response-type code \
        --scope profile,email,openid \
        --redirect-uri http://localhost:3000/api/auth/callback/onlineweb
```
