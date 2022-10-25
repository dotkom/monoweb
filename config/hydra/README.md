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