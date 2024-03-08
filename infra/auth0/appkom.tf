resource "auth0_client" "appkom_opptak" {
  allowed_clients = []
  allowed_logout_urls = {
    "dev" = ["http://localhost:3000"]
    "stg" = []
    "prd" = ["https://online-opptak.vercel.app"]
  }[terraform.workspace]
  allowed_origins = []
  app_type        = "spa"
  callbacks = {
    "dev" = ["http://localhost:3000/api/auth/callback/auth0"]
    "stg" = []
    "prd" = ["https://online-opptak.vercel.app/api/auth/callback/auth0"]
  }[terraform.workspace]
  grant_types = ["authorization_code", "refresh_token"]
  name        = "Online Komitéopptak${local.name_suffix[terraform.workspace]}"

  is_first_party  = true
  oidc_conformant = true

  jwt_configuration {
    alg = "RS256"
  }
}

data "auth0_client" "appkom_opptak" {
  client_id = auth0_client.appkom_opptak.client_id
}

resource "auth0_client" "appkom_events_app" {
  description     = "Appkom sin Online Events app"
  allowed_clients = []
  allowed_logout_urls = {
    "dev" = ["http://localhost:3000"]
    "stg" = []
    "prd" = [
      "ntnu.online.app://auth.online.ntnu.no/ios/ntnu.online.app/callback",
    ]
  }[terraform.workspace]
  allowed_origins = []
  app_type        = "native"
  callbacks = {
    "dev" = [
      "ntnu.online.app://dev.auth.online.ntnu.no/ios/ntnu.online.app/callback",
      "https://dev.auth.online.ntnu.no/android/ntnu.online.app/callback",
    ]
    "stg" = []
    "prd" = [
      "ntnu.online.app://auth.online.ntnu.no/ios/ntnu.online.app/callback",
      "https://auth.online.ntnu.no/android/ntnu.online.app/callback",
    ]
  }[terraform.workspace]
  grant_types = ["authorization_code", "refresh_token"]
  name        = "Online Events App${local.name_suffix[terraform.workspace]}"

  is_first_party  = true
  oidc_conformant = true

  jwt_configuration {
    alg = "RS256"
  }

  mobile {
    ios {
      app_bundle_identifier = "ntnu.online.app"
    }
  }
}

data "auth0_client" "appkom_events_app" {
  client_id = auth0_client.appkom_events_app.client_id
}
