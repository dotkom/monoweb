resource "auth0_tenant" "tenant" {
  allow_organization_name_in_authentication_api = false
  allowed_logout_urls                           = ["https://online.ntnu.no","https://online.ntnu.no/*"]
  default_audience                              = "https://online.ntnu.no"
  default_directory                             = null
  default_redirection_uri                       = "https://online.ntnu.no"
  enabled_locales                               = ["nb", "en", "no", "nn"]
  friendly_name                                 = "Online, Linjeforeningen for informatikk"
  picture_url                                   = "https://cdn.online.ntnu.no/branding/online-logo.svg"
  sandbox_version                               = "18"
  support_email                                 = "dotkom@online.ntnu.no"

  session_lifetime                = 2160 # 90 days
  idle_session_lifetime           = 720  # 30 days
  ephemeral_session_lifetime      = 168  # 7 days
  idle_ephemeral_session_lifetime = 72   # 3 days

  sessions {
    oidc_logout_prompt_enabled = false
  }
}

data "auth0_tenant" "tenant" {}

locals {
  custom_domain = {
    "dev" = "auth.dev.online.ntnu.no"
    "prd" = "auth.online.ntnu.no"
  }[terraform.workspace]
  name_suffix = {
    "dev" = " dev"
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
  favicon_url = "https://cdn.online.ntnu.no/branding/online-icon.png"
  logo_url    = "https://cdn.online.ntnu.no/branding/online-logo.svg"

  colors {
    # Online-orange
    primary = "#F9B759"
    # online-blue
    page_background = "#0D5474"
  }

  universal_login {
    body = templatefile("branding/universal_login_base.html",
      {
        "dev" = {
          "ENV_SPECIFIC" : <<-EOT
            <style>
              .env-dev-banner {
                position: absolute;
                top: 0.5rem;
                left: 0.5rem;
                right: 0.5rem;
                z-index: 99;
                padding: 0.66rem 1rem;
                text-align: center;
                font-family: "Figtree", "Inter", system-ui, sans-serif;
                font-size: 1rem;
                font-weight: 600;
                color: oklch(97.1% 0.013 17.38);
                background: oklch(57.7% 0.245 27.325);
                border-bottom: 1px solid oklch(44.4% 0.177 26.899);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
                border-radius: 0.5rem;
              }
            </style>
            <div class="env-dev-banner" role="status">Development</div>
          EOT
        }
        "prd" = {
          "ENV_SPECIFIC" : ""
        }
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
  token_lifetime                                  = 600 # 10 minutes
  token_lifetime_for_web                          = 600 # 10 minutes
  verification_location                           = null
}

resource "auth0_connection" "feide" {
  display_name         = "FEIDE"
  is_domain_connection = false
  metadata             = {}
  name                 = "FEIDE"
  # realms               = ["FEIDE"]
  show_as_button = null
  strategy       = "oauth2"
  options {
    icon_url               = "https://online.ntnu.no/feide-symbol-black.svg"
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
}

resource "auth0_client" "vengeful_vineyard_frontend" {
  cross_origin_auth = true # this is set to avoid breaking client. It was set in auth0 dashboard. Unknown motivation.
  cross_origin_loc  = "https://vinstraff.no/*"
  allowed_origins = [
    "http://localhost:3000"
  ]
  app_type = "spa"
  allowed_logout_urls = {
    "dev" = ["http://localhost:3000","http://localhost:3000/*"]
    "prd" = ["https://vinstraff.no","https://vinstraff.no/*"]
  }[terraform.workspace]
  callbacks = {
    "dev" = [
      "http://localhost:3000",
      "http://localhost:8000",
      "http://localhost:3000/docs/oauth2-redirect",
      "http://localhost:8000/docs/oauth2-redirect",
    ]
    "prd" = [
      "https://vinstraff.no",
      "https://vinstraff.no/docs/oauth2-redirect",
      "http://localhost:3000",
      "http://localhost:8000",
      "http://localhost:3000/docs/oauth2-redirect"
    ]
  }[terraform.workspace]
  grant_types                   = ["authorization_code", "refresh_token"]
  name                          = "Vinstraff${local.name_suffix[terraform.workspace]}"
  organization_require_behavior = "no_prompt"
  is_first_party                = true
  oidc_conformant               = true

  refresh_token {
    rotation_type                = "rotating"
    expiration_type              = "expiring"
    infinite_token_lifetime      = false
    infinite_idle_token_lifetime = false
    leeway                       = 60 # 1 minute

    token_lifetime      = 7776000 # 90 days
    idle_token_lifetime = 2592000 # 30 days
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
    # Key here is name of doppler project
    monoweb-web       = data.auth0_client.monoweb_web
    monoweb-dashboard = data.auth0_client.monoweb_dashboard
    monoweb-rpc       = data.auth0_client.rpc
    vengeful-vineyard = data.auth0_client.vengeful_vineyard_frontend

    appkom-opptakssystem = data.auth0_client.appkom_opptak
    appkom-onlineapp     = data.auth0_client.appkom_events_app
    appkom-autobank      = data.auth0_client.appkom_autobank
    appkom-veldedighet   = data.auth0_client.appkom_veldedighet
  }
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
  value   = data.auth0_tenant.tenant.domain
}

resource "doppler_secret" "auth0_issuer_rest" {
  for_each = local.projects

  project = each.key
  config  = terraform.workspace
  name    = "AUTH0_ISSUER"
  value   = "https://${local.custom_domain}"
}

resource "doppler_secret" "auth0_audiences" {
  for_each = local.projects

  project = each.key
  config  = terraform.workspace
  name    = "AUTH0_AUDIENCES"
  value   = auth0_resource_server.online.identifier
}

resource "doppler_secret" "rpc_web_client_id" {
  project = "monoweb-rpc"
  config  = terraform.workspace
  name    = "AUTH0_WEB_CLIENT_ID"
  value   = data.auth0_client.monoweb_web.client_id
}

resource "doppler_secret" "rpc_web_client_secret" {
  project = "monoweb-rpc"
  config  = terraform.workspace
  name    = "AUTH0_WEB_CLIENT_SECRET"
  value   = data.auth0_client.monoweb_web.client_secret
}

resource "auth0_client" "auth0_account_management_api_management_client" {
  is_first_party    = true
  app_type          = "non_interactive"
  name              = "Auth0 Account Management API Management Client"
  cross_origin_auth = true # this is set to avoid breaking client. It was set in auth0 dashboard. Unknown motivation.

  jwt_configuration {
    alg = "RS256"
  }
}

# has to be imported on new tenant
resource "auth0_connection_clients" "username_password_authentication" {
  connection_id = auth0_connection.username_password_authentication.id

  enabled_clients = [
    auth0_client.monoweb_web.client_id,
    auth0_client.monoweb_dashboard.client_id,
    auth0_client.vengeful_vineyard_frontend.client_id,
    auth0_client.appkom_opptak.client_id,
    auth0_client.appkom_events_app.client_id,
    auth0_client.appkom_autobank.client_id,
    auth0_client.appkom_veldedighet.client_id
  ]
}

resource "auth0_connection_clients" "feide" {
  connection_id = auth0_connection.feide.id

  enabled_clients = [
    auth0_client.monoweb_web.client_id,
    auth0_client.monoweb_dashboard.client_id,
    auth0_client.vengeful_vineyard_frontend.client_id,
    auth0_client.appkom_opptak.client_id,
    auth0_client.appkom_events_app.client_id,
    auth0_client.appkom_autobank.client_id,
    auth0_client.appkom_veldedighet.client_id,
  ]
}

resource "auth0_prompt" "prompts" {
  identifier_first               = true
  universal_login_experience     = "new"
  webauthn_platform_first_factor = false
}

# This adds a full name field to the signup form
resource "auth0_prompt_screen_partial" "signup_password_full_name" {
  prompt_type = "signup-password"
  screen_name = "signup-password"

  insertion_points {
    form_content_start = <<-HTML
    {% assign locale_lower = locale | downcase %}
    {% assign locale_token = '|' | append: locale_lower | append: '|' %}
    {% assign norwegian_locales = '|nb|no|nn|nb-no|no-no|nn-no|' %}
    <div class="ulp-field">
      <label for="full-name">{% if norwegian_locales contains locale_token %}Fullt navn{% else %}Full name{% endif %}</label>
      <input id="full-name" name="ulp-full-name" type="text" autocomplete="name" required>
      <div class="ulp-error-info">{% if norwegian_locales contains locale_token %}Fullt navn er påkrevd{% else %}Full name is required{% endif %}</div>
    </div>
    HTML
  }
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

    authentication_methods {
      passkey {
        enabled = true
      }
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

resource "auth0_client" "rpc" {
  cross_origin_auth = true # this is set to avoid breaking client. It was set in auth0 dashboard. Unknown motivation.
  allowed_clients   = []
  allowed_origins   = []
  app_type          = "non_interactive" # this is a machine to machine application
  grant_types       = ["client_credentials"]
  name              = "rpc"
  is_first_party    = true
  oidc_conformant   = true

  jwt_configuration {
    alg = "RS256"
  }
}

data "auth0_client" "rpc" {
  client_id = auth0_client.rpc.client_id
}

resource "auth0_client_grant" "rpc" {
  audience  = "https://${data.auth0_tenant.tenant.domain}/api/v2/"
  client_id = auth0_client.rpc.client_id
  scopes = [
    "read:users",
    "update:users",
    "read:user_idp_tokens"
  ]
}

# Grants the web client access to the Management API for account linking. The users.link endpoint requires the
# Management Client's client_id to match the aud claim in the ID token, so we use the web client credentials.
resource "auth0_client_grant" "monoweb_web_mgmt" {
  audience  = "https://${data.auth0_tenant.tenant.domain}/api/v2/"
  client_id = auth0_client.monoweb_web.client_id
  scopes = [
    "update:users"
  ]
}

resource "auth0_client" "monoweb_web" {
  cross_origin_auth = true # this is set to avoid breaking client. It was set in auth0 dashboard. Unknown motivation.
  cross_origin_loc  = "https://online.ntnu.no/*"
  allowed_clients   = []
  allowed_origins   = []
  app_type          = "regular_web"
  # you go here if you decline an (auth) grant, cannot be http
  initiate_login_uri = {
    "dev" = null
    "prd" = "https://online.ntnu.no/api/auth/callback/auth0"
  }[terraform.workspace]
  callbacks = {
    "dev" = ["http://localhost:3000/api/auth/callback/auth0", "http://localhost:3000/api/auth/link-identity/callback"]
    "prd" = ["https://online.ntnu.no/api/auth/callback/auth0", "https://online.ntnu.no/api/auth/link-identity/callback"]
  }[terraform.workspace]
  allowed_logout_urls = concat(
    {
      "dev" = ["http://localhost:3000","http://localhost:3000/*"]
      "prd" = ["https://online.ntnu.no","https://online.ntnu.no/*"]
    }[terraform.workspace]
  )

  grant_types     = ["authorization_code", "refresh_token", "client_credentials"]
  is_first_party  = true
  name            = "OnlineWeb${local.name_suffix[terraform.workspace]}"
  oidc_conformant = true

  refresh_token {
    rotation_type                = "non-rotating"
    expiration_type              = "expiring"
    infinite_token_lifetime      = false
    infinite_idle_token_lifetime = false
    leeway                       = 60 # 1 minute

    token_lifetime      = 7776000 # 90 days
    idle_token_lifetime = 2592000 # 30 days
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
  cross_origin_auth = true # this is set to avoid breaking client. It was set in auth0 dashboard. Unknown motivation.
  app_type          = "regular_web"
  callbacks = concat(
    {
      "dev" = ["http://localhost:3002/api/auth/callback/auth0"]
      "prd" = [
        "https://dashboard.online.ntnu.no/api/auth/callback/auth0",
        "https://online.ntnu.no/api/auth/callback/auth0"
      ]
  }[terraform.workspace])
  allowed_logout_urls = concat(
    {
      "dev" = ["http://localhost:3002","http://localhost:3002/*"]
      "prd" = ["https://dashboard.online.ntnu.no","https://dashboard.online.ntnu.no/*"]
    }[terraform.workspace]
  )
  grant_types     = ["authorization_code", "refresh_token", "client_credentials"]
  name            = "OnlineWeb Dashboard${local.name_suffix[terraform.workspace]}"
  oidc_conformant = true
  is_first_party  = true

  refresh_token {
    rotation_type                = "non-rotating"
    expiration_type              = "expiring"
    infinite_token_lifetime      = false
    infinite_idle_token_lifetime = false
    leeway                       = 60 # 1 minute

    token_lifetime      = 7776000 # 90 days
    idle_token_lifetime = 2592000 # 30 days
  }

  jwt_configuration {
    alg = "RS256"
  }
}

data "auth0_client" "monoweb_dashboard" {
  client_id = auth0_client.monoweb_dashboard.client_id
}

resource "auth0_action" "sync_feide_name" {
  name    = "Sync FEIDE name"
  runtime = "node18"
  code    = file("js/actions/syncFeideName.js")
  deploy  = true

  supported_triggers {
    id      = "post-login"
    version = "v3"
  }

  secrets {
    name  = "FEIDE_CONNECTION_ID"
    value = auth0_connection.feide.id
  }
}

resource "auth0_branding_theme" "default" {
  display_name = "Online Theme"

  borders {
    button_border_radius = 8
    button_border_weight = 1
    buttons_style        = "rounded"
    input_border_radius  = 8
    input_border_weight  = 1
    inputs_style         = "rounded"
    show_widget_shadow   = true
    widget_border_weight = 0
    widget_corner_radius = 16
  }

  colors {
    base_focus_color          = "#635dff"
    base_hover_color          = "#000000"
    body_text                 = "#1e212a"
    captcha_widget_theme      = "light"
    error                     = "#d03c38"
    header                    = "#1e212a"
    icons                     = "#65676e"
    input_background          = "#ffffff"
    input_border              = "#c9cace"
    input_filled_text         = "#000000"
    input_labels_placeholders = "#65676e"
    links_focused_components  = "#635dff"
    primary_button            = "#F9B759"
    primary_button_label      = "#ffffff"
    secondary_button_border   = "#c9cace"
    secondary_button_label    = "#1e212a"
    success                   = "#13a688"
    widget_background         = "#ffffff"
    widget_border             = "#c9cace"
  }

  fonts {
    font_url            = "https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/latin-wght-normal.woff2"
    links_style         = "normal"
    reference_text_size = 16

    body_text {
      bold = false
      size = 87.5
    }

    buttons_text {
      bold = false
      size = 100
    }

    input_labels {
      bold = false
      size = 100
    }

    links {
      bold = true
      size = 87.5
    }

    subtitle {
      bold = false
      size = 87.5
    }

    title {
      bold = false
      size = 150
    }
  }

  page_background {
    background_color     = "#0D5474"
    background_image_url = null
    page_layout          = "center"
  }

  widget {
    header_text_alignment = "left"
    logo_height           = 52
    logo_position         = "center"
    logo_url              = "https://cdn.online.ntnu.no/branding/online-logo.svg"
    social_buttons_layout = "top"
  }
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
