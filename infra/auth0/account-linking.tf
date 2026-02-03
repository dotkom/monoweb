resource "auth0_client" "account_linker_web" {
  app_type       = "regular_web"
  name           = "Account Linker Web${local.name_suffix[terraform.workspace]}"
  is_first_party = true
  oidc_conformant = true

  callbacks = {
    "dev" = ["http://localhost:3000/api/auth/link-identity/callback"]
    "stg" = ["https://staging.online.ntnu.no/api/auth/link-identity/callback"]
    "prd" = ["https://online.ntnu.no/api/auth/link-identity/callback"]
  }[terraform.workspace]

  grant_types = ["authorization_code"]

  jwt_configuration {
    alg = "RS256"
  }
}