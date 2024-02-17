# Auth0 Setup

How Auth0 external IDP works

https://auth0.com/docs/authenticate/identity-providers/calling-an-external-idp-api

```json
{
  "email": "john.doe@test.com",
  "email_verified": true,
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://myavatar/photo.jpg",
  "gender": "male",
  "locale": "en",
  "updated_at": "2017-03-15T07:14:32.451Z",
  "user_id": "google-oauth2|*****",
  "nickname": "john.doe",
  "identities": [
    {
      "provider": "google-oauth2",
      "access_token": "*****",
      "expires_in": 3599,
      "user_id": "********",
      "connection": "google-oauth2",
      "isSocial": true
    }
  ],
  "created_at": "2017-03-15T07:13:41.134Z",
  "last_ip": "127.0.0.1",
  "last_login": "2017-03-15T07:14:32.451Z",
  "logins_count": 99
}
```

You need the `read:user_idp_tokens` scope to read the `access_token`, not on by default with the CLI, to test this locally use

```shell
auth0 login --scopes read:user_idp_tokens
```

