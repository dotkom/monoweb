# Temporary OAuth client for Ola's public Mastersal Vinstraff site.
# It should be decommissioned by June 2027.
resource "auth0_client" "ola_mastersal" {
  description       = "Temporary production OAuth client for Mastersal Vinstraff (https://mastersal.vercel.app). Review and decommission by June 2027."
  cross_origin_auth = true
  allowed_clients   = []
  allowed_origins   = []
  app_type          = "regular_web"
  callbacks = {
    "dev" = ["http://localhost:3000/api/auth/callback"]
    "stg" = ["http://localhost:3000/api/auth/callback"]
    "prd" = [
      "https://mastersal.vercel.app/api/auth/callback",
      "http://localhost:3000/api/auth/callback",
    ]
  }[terraform.workspace]
  allowed_logout_urls = {
    "dev" = ["http://localhost:3000", "http://localhost:3000/*"]
    "stg" = ["http://localhost:3000", "http://localhost:3000/*"]
    "prd" = [
      "https://mastersal.vercel.app",
      "https://mastersal.vercel.app/*",
      "http://localhost:3000",
      "http://localhost:3000/*",
    ]
  }[terraform.workspace]
  grant_types                   = ["authorization_code", "refresh_token"]
  name                          = "Mastersal Vinstraff${local.name_suffix[terraform.workspace]}"
  organization_require_behavior = "no_prompt"
  is_first_party                = true
  oidc_conformant               = true

  refresh_token {
    rotation_type                = "rotating"
    expiration_type              = "expiring"
    infinite_token_lifetime      = false
    infinite_idle_token_lifetime = false
    leeway                       = 60

    token_lifetime      = 7776000 # 90 days
    idle_token_lifetime = 2592000 # 30 days
  }

  jwt_configuration {
    alg = "RS256"
  }
}

data "auth0_client" "ola_mastersal" {
  client_id = auth0_client.ola_mastersal.client_id
}

