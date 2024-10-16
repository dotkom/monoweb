resource "auth0_tenant" "tenant" {
  allow_organization_name_in_authentication_api = false
  allowed_logout_urls                           = ["https://online.ntnu.no"]
  default_audience                              = "https://online.ntnu.no"
  default_directory                             = null
  default_redirection_uri                       = "https://online.ntnu.no"
  enabled_locales                               = ["nb", "en", "no", "nn"]
  friendly_name                                 = "Online, Linjeforeningen for informatikk"
  idle_session_lifetime                         = 72
  # TODO: make S3 bucket for this
  # this is just the O
  picture_url      = "https://old.online.ntnu.no/wiki/70/plugin/attachments/download/679/"
  sandbox_version  = "18"
  session_lifetime = 168
  support_email    = "dotkom@online.ntnu.no"
}

data "auth0_tenant" "tenant" {}

locals {
  custom_domain = {
    "dev" = "auth.dev.online.ntnu.no"
    "stg" = "auth.stg.online.ntnu.no"
    "prd" = "auth.online.ntnu.no"
  }[terraform.workspace]
  name_suffix = {
    "dev" = " Dev"
    "stg" = " Staging"
    "prd" = ""
  }
}

# we cannot set that this is the domain used in email here.
resource "auth0_custom_domain" "auth_onn" {
  domain = local.custom_domain
  type   = "auth0_managed_certs"
}

resource "auth0_custom_domain_verification" "custom_domain_verification" {
  depends_on       = [aws_route53_record.auth0_custom_domain]
  custom_domain_id = auth0_custom_domain.auth_onn.id
  timeouts { create = "15m" }
}

resource "aws_route53_record" "auth0_custom_domain" {
  zone_id = data.aws_route53_zone.online.zone_id
  name    = "${auth0_custom_domain.auth_onn.domain}."
  type    = upper(auth0_custom_domain.auth_onn.verification[0].methods[0].name)
  ttl     = 300
  records = ["${auth0_custom_domain.auth_onn.verification[0].methods[0].record}."]
}

resource "auth0_branding" "branding" {
  favicon_url = "https://online.ntnu.no/img/icons/icon-256.png"
  # this appears to be bugged, TF appears to read it as picture_url?
  logo_url = "https://old.online.ntnu.no/wiki/70/plugin/attachments/download/679/"

  colors {
    # Online-orange
    primary = "#F9B759"
    # online-blue
    page_background = "#0D5474"
  }

  universal_login {
    body = templatefile("branding/universal_login_base.html",
      {
        "dev" = { "ENV_SPECIFIC" : <<EOT
        <style>
        .warning {
          font-family: comic sans ms;
          color: hotpink;
          font-size: 13vw;
        }
        </style>
        <h1 class="warning">DEVELOPMENT</h1>
        EOT
        }
        "stg" = { "ENV_SPECIFIC" : <<EOT
        <style>
        .warning {
          font-family: comic sans ms;
          color: orangered;
          font-size: 13vw;
        }
        :root {
          --page-background-color: firebrick;
        }
        </style>
        <h1 class="warning">STAGING</h1>
        EOT
        }
        "prd" = { "ENV_SPECIFIC" : "" }
      }[terraform.workspace]
    )
  }
}

resource "auth0_resource_server" "online" {
  allow_offline_access                            = true
  enforce_policies                                = true
  identifier                                      = "https://online.ntnu.no"
  name                                            = "Online"
  signing_alg                                     = "RS256"
  signing_secret                                  = null
  skip_consent_for_verifiable_first_party_clients = true
  token_dialect                                   = "access_token_authz"
  token_lifetime                                  = 86400
  token_lifetime_for_web                          = 7200
  verification_location                           = null
}

# TODO: feide-log-in
resource "auth0_connection" "feide" {
  display_name         = "FEIDE"
  is_domain_connection = false
  metadata             = {}
  name                 = "FEIDE"
  # realms               = ["FEIDE"]
  show_as_button = null
  strategy       = "oauth2"
  options {
    allowed_audiences      = []
    api_enable_users       = false
    auth_params            = {}
    authorization_endpoint = "https://auth.dataporten.no/oauth/authorization"
    token_endpoint         = "https://auth.dataporten.no/oauth/token"
    client_id              = var.FEIDE_CLIENT_ID
    client_secret          = var.FEIDE_CLIENT_SECRET
    scopes                 = ["email", "groups", "openid", "phone_number", "profile", "userid-feide"]
    scripts = {
      fetchUserProfile = file("js/fetchUserProfile.js")
    }
  }

  count = terraform.workspace == "prd" ? 0 : 1
}

resource "auth0_client" "wiki_frontend" {
  app_type = "regular_web"
  callbacks = {
    "dev" = [
      "http://localhost:3001/api/auth/callback/auth0",
    ]
    "stg" = [
      "https://wiki.staging.online.ntnu.no/api/auth/callback/auth0",
    ]
    "prd" = [
      "https://wiki.online.ntnu.no/api/auth/callback/auth0",
    ]
  }[terraform.workspace]
  grant_types     = ["authorization_code", "refresh_token"]
  name            = "Wiki${local.name_suffix[terraform.workspace]}"
  is_first_party  = true
  oidc_conformant = true

  allowed_clients     = []
  allowed_logout_urls = []
  allowed_origins     = []
  # you go here if you decline an auth grant
  initiate_login_uri = "https://${terraform.workspace}.web.online.ntnu.no/api/auth/callback/auth0"
  refresh_token {
    rotation_type   = "rotating"
    expiration_type = "expiring"
  }

  # organization_require_behavior is here since so that terraform does not attempt to apply it everytime
  organization_require_behavior = "no_prompt"
  jwt_configuration {
    alg = "RS256"
  }

  count = terraform.workspace == "prd" ? 0 : 1
}

data "auth0_client" "wiki_frontend" {
  client_id = auth0_client.wiki_frontend[0].client_id
  count     = terraform.workspace == "prd" ? 0 : 1
}

resource "auth0_connection_clients" "feide" {
  connection_id = auth0_connection.feide[0].id
  enabled_clients = concat([
    auth0_client.onlineweb_frontend.client_id,
    auth0_client.onlineweb4.client_id,
    auth0_client.monoweb_web.client_id,
    auth0_client.monoweb_dashboard.client_id,
    auth0_client.appkom_autobank.client_id,
    auth0_client.vengeful_vineyard_frontend.client_id,
  ], terraform.workspace != "prd" ? [auth0_client.wiki_frontend[0].client_id] : [])

  count = terraform.workspace == "prd" ? 0 : 1
}

# resource "auth0_action" "klassetrinn_autoconf" {
#   name = "Klassetrinn Autoconf"
#   code = file("js/klassetrinn.js")

#   supported_triggers {
#     id = "post_signup"
#     version = "v3"
#   }
# }

resource "auth0_client" "vengeful_vineyard_frontend" {
  app_type = "spa"
  callbacks = {
    "dev" = [
      "http://localhost:3000",
      "http://localhost:8000",
      "http://localhost:3000/docs/oauth2-redirect",
      "http://localhost:8000/docs/oauth2-redirect",
    ]
    "stg" = [
      "https://staging.vinstraff.no",
      "https://staging.vinstraff.no/docs/oauth2-redirect",
    ]
    "prd" = [
      "https://vinstraff.no",
      "https://vinstraff.no/docs/oauth2-redirect",
      "http://localhost:3000",
      "http://localhost:8000",
      "http://localhost:3000/docs/oauth2-redirect",
    ]
  }[terraform.workspace]
  grant_types                   = ["authorization_code", "refresh_token"]
  name                          = "Vengeful Vineyard${local.name_suffix[terraform.workspace]}"
  organization_require_behavior = "no_prompt"
  is_first_party                = true
  oidc_conformant               = true

  refresh_token {
    rotation_type   = "rotating"
    expiration_type = "expiring"
  }

  jwt_configuration {
    alg = "RS256"
  }
}

data "auth0_client" "vengeful_vineyard_frontend" {
  client_id = auth0_client.vengeful_vineyard_frontend.client_id
}

locals {
  projects = {
    # key here must be project name
    vengeful-vineyard    = data.auth0_client.vengeful_vineyard_frontend
    onlineweb4           = data.auth0_client.onlineweb4
    onlineweb-frontend   = data.auth0_client.onlineweb_frontend
    appkom-opptakssystem = data.auth0_client.appkom_opptak
    appkom-onlineapp     = data.auth0_client.appkom_events_app
    appkom-autobank      = data.auth0_client.appkom_autobank
  }

  monoweb = merge({
    web       = data.auth0_client.monoweb_web
    dashboard = data.auth0_client.monoweb_dashboard
    gtx       = data.auth0_client.gtx
    },
    terraform.workspace != "prd" ? { wiki = data.auth0_client.wiki_frontend } : {}
  )
}

resource "doppler_secret" "client_ids" {
  for_each = local.projects
  project  = each.key
  config   = terraform.workspace
  name     = "AUTH0_CLIENT_ID"
  value    = each.value.client_id
}

resource "doppler_secret" "client_secrets" {
  for_each = local.projects

  project = each.key
  config  = terraform.workspace
  name    = "AUTH0_CLIENT_SECRET"
  value   = each.value.client_secret
}

resource "doppler_secret" "mgmt_tenants" {
  for_each = local.projects

  project = each.key
  config  = terraform.workspace
  name    = "AUTH0_MGMT_TENANT"
  value   = "https://${data.auth0_tenant.tenant.domain}/api/v2/"
}

resource "doppler_secret" "auth0_issuer_rest" {
  for_each = local.projects

  project = each.key
  config  = terraform.workspace
  name    = "AUTH0_ISSUER"
  value   = "https://${local.custom_domain}"
}

# monoweb should be two doppler-projects
resource "doppler_secret" "client_ids_monoweb" {
  for_each = local.monoweb

  project = "monoweb"
  config  = terraform.workspace
  name    = "${upper(each.key)}_AUTH0_CLIENT_ID"
  value   = each.value.client_id
}

resource "doppler_secret" "client_secrets_monoweb" {
  for_each = local.monoweb

  project = "monoweb"
  config  = terraform.workspace
  name    = "${upper(each.key)}_AUTH0_CLIENT_SECRET"
  value   = each.value.client_secret
}

resource "doppler_secret" "auth0_issuer_monoweb" {
  for_each = local.monoweb

  project = "monoweb"
  config  = terraform.workspace
  name    = "${upper(each.key)}_AUTH0_ISSUER"
  value   = "https://${local.custom_domain}"
}

resource "doppler_secret" "mgmt_tenants_monoweb" {
  for_each = local.monoweb

  project = "monoweb"
  config  = terraform.workspace
  name    = "${upper(each.key)}_AUTH0_MGMT_TENANT"
  value   = "https://${data.auth0_tenant.tenant.domain}/api/v2/"
}

resource "auth0_client" "onlineweb_frontend" {
  app_type = "spa"
  allowed_logout_urls = {
    "dev" = ["http://localhost:8080"]
    "stg" = ["https://*-dotkom.vercel.app", "https://dev.online.ntnu.no"]
    "prd" = ["https://old.online.ntnu.no/auth/login/", "https://online.ntnu.no"]
  }[terraform.workspace]
  callbacks = {
    "dev" = ["http://localhost:8080/authentication/callback"]
    "stg" = ["https://*-dotkom.vercel.app/authentication/callback"]
    "prd" = ["https://online.ntnu.no/authentication/callback"]
  }[terraform.workspace]
  grant_types                   = ["authorization_code", "implicit", "refresh_token"]
  name                          = "OnlineWeb Frontend${local.name_suffix[terraform.workspace]}"
  organization_require_behavior = "no_prompt"
  is_first_party                = true
  oidc_conformant               = true

  jwt_configuration {
    alg = "RS256"
  }

  refresh_token {
    rotation_type   = "rotating"
    expiration_type = "expiring"
  }
}

data "auth0_client" "onlineweb_frontend" {
  client_id = auth0_client.onlineweb_frontend.client_id
}

resource "auth0_client" "auth0_account_management_api_management_client" {
  is_first_party = true
  app_type       = "non_interactive"
  name           = "Auth0 Account Management API Management Client"

  jwt_configuration {
    alg = "RS256"
  }
}

# has to be imported on new tenant
resource "auth0_connection_clients" "username_password_authentication" {
  connection_id = auth0_connection.username_password_authentication.id
  enabled_clients = concat([
    auth0_client.onlineweb_frontend.client_id,
    auth0_client.onlineweb4.client_id,
    auth0_client.monoweb_web.client_id,
    auth0_client.monoweb_dashboard.client_id,
    auth0_client.vengeful_vineyard_frontend.client_id,
    auth0_client.appkom_opptak.client_id,
    auth0_client.appkom_events_app.client_id,
    auth0_client.appkom_autobank.client_id,
  ], terraform.workspace == "prd" ? [] : [auth0_client.wiki_frontend[0].client_id])
}

resource "auth0_prompt" "prompts" {
  identifier_first               = true
  universal_login_experience     = "new"
  webauthn_platform_first_factor = false
}

# this has to be imported when creating a new tenant
resource "auth0_connection" "username_password_authentication" {
  display_name         = null
  is_domain_connection = false
  metadata             = {}
  name                 = "Username-Password-Authentication"
  realms               = ["Username-Password-Authentication"]
  show_as_button       = null
  strategy             = "auth0"
  options {
    password_policy        = "good"
    brute_force_protection = true
    custom_scripts = {
      "change_password" = file("js/tenant/changePassword.js")
      "create"          = file("js/tenant/create.js")
      "delete"          = file("js/tenant/remove.js")
      "get_user"        = file("js/tenant/getByEmail.js")
      "login"           = file("js/tenant/login.js")
      "verify"          = file("js/tenant/verify.js")
    }
    mfa {
      active                 = true
      return_enroll_settings = true
    }
    password_complexity_options {
      min_length = 8
    }
    password_dictionary {
      dictionary = []
      enable     = true
    }
    password_history {
      enable = false
      size   = 5
    }
    password_no_personal_info {
      enable = true
    }
  }
}

# this is Auth0's 2FA, not relevant
resource "auth0_guardian" "guardian" {
  email  = false
  otp    = false
  policy = "never"
}

# this cannot be modified or deleted, has to be imported on new tenant
resource "auth0_resource_server" "auth0_management_api" {
  identifier  = "https://${data.auth0_tenant.tenant.domain}/api/v2/"
  name        = "Auth0 Management API"
  signing_alg = "RS256"
}

resource "auth0_client" "gtx" {
  allowed_clients = []
  allowed_origins = []
  app_type        = "non_interactive" # this is a machine to machine application
  grant_types     = ["client_credentials"]
  name            = "gtx"
  is_first_party  = true
  oidc_conformant = true

  jwt_configuration {
    alg = "RS256"
  }
}

data "auth0_client" "gtx" {
  client_id = auth0_client.gtx.client_id
}

resource "auth0_client_grant" "monoweb_backend_mgmt_grant" {
  audience  = "https://${data.auth0_tenant.tenant.domain}/api/v2/"
  client_id = auth0_client.gtx.client_id
  scopes = [
    "read:users",
    "update:users",
  ]
}

resource "auth0_client" "onlineweb4" {
  allowed_clients = []
  allowed_logout_urls = {
    "dev" = ["http://localhost:8000", "http://127.0.0.1:8000"]
    "stg" = ["https://dev.online.ntnu.no"]
    "prd" = ["https://old.online.ntnu.no"]
  }[terraform.workspace]
  allowed_origins = []
  app_type        = "regular_web"
  callbacks = {
    "dev" = ["http://localhost:8000/auth0/callback/", "http://127.0.0.1:8000/auth0/callback/"]
    "stg" = ["https://dev.online.ntnu.no/auth0/callback/"]
    "prd" = ["https://old.online.ntnu.no/auth0/callback/"]
  }[terraform.workspace]
  grant_types = ["authorization_code", "client_credentials", "refresh_token"]
  name        = "OnlineWeb4${local.name_suffix[terraform.workspace]}"

  is_first_party                = true
  oidc_conformant               = true
  organization_require_behavior = "no_prompt"

  refresh_token {
    rotation_type   = "rotating"
    expiration_type = "expiring"
  }

  jwt_configuration {
    alg = "RS256"
  }
}

data "auth0_client" "onlineweb4" {
  client_id = auth0_client.onlineweb4.client_id
}

resource "auth0_client_grant" "ow4_mgmt_grant" {
  audience  = "https://${data.auth0_tenant.tenant.domain}/api/v2/"
  client_id = auth0_client.onlineweb4.client_id
  scopes = [
    "update:users",
    "create:user_tickets", # to send verification emails
  ]
}
resource "auth0_client" "monoweb_web" {
  allowed_clients     = []
  allowed_logout_urls = []
  allowed_origins     = []
  app_type            = "regular_web"
  # you go here if you decline an auth grant
  initiate_login_uri = "https://${terraform.workspace}.web.online.ntnu.no/api/auth/callback/auth0"
  callbacks = concat(
    ["https://${terraform.workspace}.web.online.ntnu.no/api/auth/callback/auth0"],
    {
      "dev" = ["http://localhost:3000/api/auth/callback/auth0", "https://web-*-dotkom.vercel.app/api/auth/callback/auth0"]
      "stg" = [] # TODO
      "prd" = ["https://online.ntnu.no/api/auth/callback/auth0"]
    }[terraform.workspace]
  )

  grant_types     = ["authorization_code", "refresh_token"]
  is_first_party  = true
  name            = "Monoweb Web${local.name_suffix[terraform.workspace]}"
  oidc_conformant = true

  refresh_token {
    rotation_type   = "rotating"
    expiration_type = "expiring"
  }

  # organization_require_behavior is here since so that terraform does not attempt to apply it everytime
  organization_require_behavior = "no_prompt"
  jwt_configuration {
    alg = "RS256"
  }
}

data "auth0_client" "monoweb_web" {
  client_id = auth0_client.monoweb_web.client_id
}

resource "auth0_client" "monoweb_dashboard" {
  app_type = "regular_web"
  callbacks = concat(
    ["https://${terraform.workspace}.dashboard.online.ntnu.no/api/auth/callback/auth0"],
    {
      "dev" = ["http://localhost:3002/api/auth/callback/auth0", "https://dashboard-*-dotkom.vercel.app/api/auth/callback/auth0"]
      "stg" = [] # TODO
      "prd" = ["https://online.ntnu.no/api/auth/callback/auth0"]
  }[terraform.workspace])
  grant_types     = ["authorization_code", "implicit", "refresh_token", "client_credentials"]
  name            = "Monoweb Dashboard${local.name_suffix[terraform.workspace]}"
  oidc_conformant = true
  is_first_party  = true

  refresh_token {
    rotation_type   = "rotating"
    expiration_type = "expiring"
  }

  jwt_configuration {
    alg = "RS256"
  }
}

data "auth0_client" "monoweb_dashboard" {
  client_id = auth0_client.monoweb_dashboard.client_id
}


resource "auth0_attack_protection" "attack_protection" {
  breached_password_detection {
    admin_notification_frequency = []
    enabled                      = false
    method                       = "standard"
    shields                      = []
  }
  brute_force_protection {
    allowlist    = []
    enabled      = true
    max_attempts = 10
    mode         = "count_per_identifier_and_ip"
    shields      = ["block", "user_notification"]
  }
  suspicious_ip_throttling {
    allowlist = []
    enabled   = true
    shields   = ["admin_notification", "block"]
    pre_login {
      max_attempts = 100
      rate         = 864000
    }
    pre_user_registration {
      max_attempts = 50
      rate         = 1200
    }
  }
}

resource "auth0_pages" "pages" {
  login {
    enabled = false
    html    = ""
  }
}

resource "auth0_role" "dotkom" {
  description = "Test"
  name        = "Dotkom"
}

resource "auth0_client_grant" "auth0_account_management_api_management_client_https_onlineweb_eu_auth0_com_api_v2" {
  audience  = "https://${data.auth0_tenant.tenant.domain}/api/v2/"
  client_id = auth0_client.auth0_account_management_api_management_client.client_id
  scopes = [
    "read:client_grants",
    "create:client_grants",
    "delete:client_grants",
    "update:client_grants",
    "read:users",
    "update:users",
    "delete:users",
    "create:users",
    "read:users_app_metadata",
    "update:users_app_metadata",
    "delete:users_app_metadata",
    "create:users_app_metadata",
    "read:user_custom_blocks",
    "create:user_custom_blocks",
    "delete:user_custom_blocks",
    "create:user_tickets",
    "read:clients",
    "update:clients",
    "delete:clients",
    "create:clients",
    "read:client_keys",
    "update:client_keys",
    "delete:client_keys",
    "create:client_keys",
    "read:connections",
    "update:connections",
    "delete:connections",
    "create:connections",
    "read:resource_servers",
    "update:resource_servers",
    "delete:resource_servers",
    "create:resource_servers",
    "read:device_credentials",
    "update:device_credentials",
    "delete:device_credentials",
    "create:device_credentials",
    "read:rules",
    "update:rules",
    "delete:rules",
    "create:rules",
    "read:rules_configs",
    "update:rules_configs",
    "delete:rules_configs",
    "read:hooks",
    "update:hooks",
    "delete:hooks",
    "create:hooks",
    "read:actions",
    "update:actions",
    "delete:actions",
    "create:actions",
    "read:email_provider",
    "update:email_provider",
    "delete:email_provider",
    "create:email_provider",
    "blacklist:tokens",
    "read:stats",
    "read:insights",
    "read:tenant_settings",
    "update:tenant_settings",
    "read:logs",
    "read:logs_users",
    "read:shields",
    "create:shields",
    "update:shields",
    "delete:shields",
    "read:anomaly_blocks",
    "delete:anomaly_blocks",
    "update:triggers",
    "read:triggers",
    "read:grants",
    "delete:grants",
    "read:guardian_factors",
    "update:guardian_factors",
    "read:guardian_enrollments",
    "delete:guardian_enrollments",
    "create:guardian_enrollment_tickets",
    "read:user_idp_tokens",
    "create:passwords_checking_job",
    "delete:passwords_checking_job",
    "read:custom_domains",
    "delete:custom_domains",
    "create:custom_domains",
    "update:custom_domains",
    "read:email_templates",
    "create:email_templates",
    "update:email_templates",
    "read:mfa_policies",
    "update:mfa_policies",
    "read:roles",
    "create:roles",
    "delete:roles",
    "update:roles",
    "read:prompts",
    "update:prompts",
    "read:branding",
    "update:branding",
    "delete:branding",
    "read:log_streams",
    "create:log_streams",
    "delete:log_streams",
    "update:log_streams",
    "create:signing_keys",
    "read:signing_keys",
    "update:signing_keys",
    "read:limits",
    "update:limits",
    "create:role_members",
    "read:role_members",
    "delete:role_members",
    "read:entitlements",
    "read:attack_protection",
    "update:attack_protection",
    "read:organizations_summary",
    "create:authentication_methods",
    "read:authentication_methods",
    "update:authentication_methods",
    "delete:authentication_methods",
    "read:organizations",
    "update:organizations",
    "create:organizations",
    "delete:organizations",
    "create:organization_members",
    "read:organization_members",
    "delete:organization_members",
    "create:organization_connections",
    "read:organization_connections",
    "update:organization_connections",
    "delete:organization_connections",
    "create:organization_member_roles",
    "read:organization_member_roles",
    "delete:organization_member_roles",
    "create:organization_invitations",
    "read:organization_invitations",
    "delete:organization_invitations",
    "read:scim_config",
    "create:scim_config",
    "update:scim_config",
    "delete:scim_config",
    "create:scim_token",
    "read:scim_token",
    "delete:scim_token",
    "delete:phone_providers",
    "create:phone_providers",
    "read:phone_providers",
    "update:phone_providers",
    "delete:phone_templates",
    "create:phone_templates",
    "read:phone_templates",
    "update:phone_templates",
    "create:encryption_keys",
    "read:encryption_keys",
    "update:encryption_keys",
    "delete:encryption_keys",
    "read:sessions",
    "delete:sessions",
    "read:refresh_tokens",
    "delete:refresh_tokens"
  ]
}
