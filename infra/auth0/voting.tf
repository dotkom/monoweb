resource "auth0_client" "voting" {
  name = "Voting ${local.name_suffix[terraform.workspace]}"
  app_type = "spa"
  callbacks = {
    "dev" = [
      "http://localhost:3000",
      "http://localhost:8000"
    ]
    "prd" = [
      "https://vedtatt.online.ntnu.no",
    ]
  }[terraform.workspace]
  allowed_logout_urls = {
    "dev" = [
      "http://localhost:3000",
      "http://localhost:8000"
    ]
    "prd" = [
      "https://vedtatt.online.ntnu.no",
    ]
  }[terraform.workspace]
}

data "auth0_client" "voting" {
  client_id = auth0_client.voting.client_id
}

resource "doppler_secret" "voting_frontend_client_id" {
  project = "voting-frontend"
  config  = terraform.workspace
  name    = "REACT_APP_AUTH0_CLIENT_ID"
  value   = auth0_client.voting.client_id
}

resource "doppler_secret" "voting_frontend_callback_url" {
  project = "voting-frontend"
  config  = terraform.workspace
  name    = "REACT_APP_AUTH0_CALLBACK_URL"
  # join the callback urls with a comma
  value  = join(",", auth0_client.voting.callbacks)
}

resource "doppler_secret" "voting_frontend_audience" {
  project = "voting-frontend"
  config  = terraform.workspace
  name    = "REACT_APP_AUTH0_AUDIENCE"
  value   = "https://${data.auth0_tenant.tenant.domain}/api/v2/"
}

resource "doppler_secret" "voting_frontend_domain" {
  project = "voting-frontend"
  config  = terraform.workspace
  name    = "REACT_APP_AUTH0_DOMAIN"
  value   = data.auth0_tenant.tenant.domain
}

resource "doppler_secret" "voting_backend_client_id" {
  project = "voting-backend"
  config  = terraform.workspace
  name    = "AUTH0_CLIENT_ID"
  value   = auth0_client.voting.client_id
}

resource "doppler_secret" "voting_backend_client_secret" {
  project = "voting-backend"
  config  = terraform.workspace
  name    = "AUTH0_CLIENT_SECRET"
  value   = data.auth0_client.voting.client_secret
}

resource "doppler_secret" "voting_backend_audience" {
  project = "voting-backend"
  config  = terraform.workspace
  name    = "AUTH0_AUDIENCE"
  value   = "https://${data.auth0_tenant.tenant.domain}/api/v2/"
}

resource "doppler_secret" "voting_backend_domain" {
  project = "voting-backend"
  config  = terraform.workspace
  name    = "AUTH0_DOMAIN"
  value   = data.auth0_tenant.tenant.domain
}