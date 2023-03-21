## Create a new client

```
docker exec hydra hydra create --endpoint http://127.0.0.1:4445 oauth2-client \
        --name onlineweb \
        --client-uri onlineweb \
        --token-endpoint-auth-method client_secret_basic \
        --grant-type authorization_code,refresh_token \
        --response-type code \
        --scope profile,email,openid \
        --redirect-uri http://localhost:3002/api/auth/callback/onlineweb
```

http://127.0.0.1:4444/oauth2/auth?client_id=115834f7-0911-4e18-a3d2-b08886b8abd4&scope=openid email profile&response_type=code&redirect_uri=http://localhost:3000&grant_type=authorization_code&state=gUqYWn6RZVeeAYEjYm9UAlTpKpepdOPc1SyO3Fy0yVI
