resource "auth0_client" "appkom_opptak" {
  allowed_clients = []
  allowed_logout_urls = {
    "dev" = ["http://localhost:3000"]
    "stg" = []
    "prd" = [
      "https://opptak.online.ntnu.no",
      "https://online-opptak.vercel.app",
      "http://localhost:3000",
    ]
  }[terraform.workspace]
  allowed_origins = []
  app_type        = "spa"
  callbacks = {
    "dev" = ["http://localhost:3000/api/auth/callback/auth0"]
    "stg" = []
    "prd" = [
      "https://online-opptak.vercel.app/api/auth/callback/auth0", 
      "https://opptak.online.ntnu.no/api/auth/callback/auth0",
      "http://localhost:3000/api/auth/callback/auth0",
    ]
  }[terraform.workspace]
  grant_types = ["authorization_code", "refresh_token"]
  name        = "Online Komitéopptak${local.name_suffix[terraform.workspace]}"

  is_first_party  = true
  oidc_conformant = true

  refresh_token {
    rotation_type   = "rotating"
    expiration_type = "expiring"
  }

  jwt_configuration {
    alg = "RS256"
  }
}

data "auth0_client" "appkom_opptak" {
  client_id = auth0_client.appkom_opptak.client_id
}

resource "auth0_client" "appkom_autobank" {
  allowed_clients = []
  allowed_logout_urls = {
    "dev" = ["http://localhost:3000/"]
    "stg" = ["https://autobank-frontend.vercel.app/"]
    "prd" = []
  }[terraform.workspace]
  allowed_origins = []
  app_type        = "spa"
  callbacks = {
    "dev" = ["http://localhost:3000/authentication/callback"]
    "stg" = ["https://autobank-frontend.vercel.app/authentication/callback"]
    "prd" = []
  }[terraform.workspace]
  grant_types = ["authorization_code", "refresh_token"]
  name        = "Autobank${local.name_suffix[terraform.workspace]}"

  is_first_party  = true
  oidc_conformant = true

  refresh_token {
    rotation_type   = "rotating"
    expiration_type = "expiring"
  }

  jwt_configuration {
    alg = "RS256"
  }
}

data "auth0_client" "appkom_autobank" {
  client_id = auth0_client.appkom_autobank.client_id
}

resource "auth0_client" "appkom_events_app" {
  description     = "Appkom sin Online Events app"
  allowed_clients = []
  allowed_logout_urls = {
    "dev" = ["http://localhost:3000"]
    "stg" = []
    "prd" = [
      "ntnu.online.app://auth.online.ntnu.no/ios/ntnu.online.app/callback",
      "https://auth.online.ntnu.no/android/ntnu.online.app/callback",
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

  refresh_token {
    rotation_type   = "rotating"
    expiration_type = "expiring"
  }

  mobile {
    ios {
      app_bundle_identifier = "ntnu.online.app"
    }

    android {
      app_package_name         = "ntnu.online.app"
      sha256_cert_fingerprints = ["30:A2:1D:7D:CA:56:8B:02:AC:E7:9E:D3:ED:E0:D7:6D:A1:D9:A7:FD:B3:A9:3D:8C:1D:B9:73:47:FD:D8:89:DD", "99:93:D8:4C:81:B9:40:7C:31:4E:B5:5B:8C:9A:03:7D:54:F2:16:2A:27:38:31:C9:32:EC:B8:40:94:49:13:9B"]
    }
  }
}

data "auth0_client" "appkom_events_app" {
  client_id = auth0_client.appkom_events_app.client_id
}
