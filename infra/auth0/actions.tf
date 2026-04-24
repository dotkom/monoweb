resource "auth0_action" "validate_and_store_full_name" {
  name    = "Validate and store full name"
  runtime = "node18"
  deploy  = true
  code    = file("${path.module}/js/actions/validateAndStoreFullName.js")

  supported_triggers {
    id      = "pre-user-registration"
    version = "v2"
  }
}

resource "auth0_action" "disallow_ntnu_mail" {
  name    = "Disallow NTNU-mail"
  runtime = "node18"
  deploy  = true
  code    = file("${path.module}/js/actions/disallowNtnuMail.js")

  supported_triggers {
    id      = "pre-user-registration"
    version = "v2"
  }

  secrets {
    name  = "DISALLOW_NTNU_MAIL"
    value = terraform.workspace == "prd" ? "true" : "false"
  }
}

resource "auth0_trigger_actions" "pre_user_registration" {
  trigger = "pre-user-registration"

  actions {
    id           = auth0_action.validate_and_store_full_name.id
    display_name = auth0_action.validate_and_store_full_name.name
  }

  actions {
    id           = auth0_action.disallow_ntnu_mail.id
    display_name = auth0_action.disallow_ntnu_mail.name
  }
}

resource "auth0_trigger_actions" "post_login" {
  trigger = "post-login"

  actions {
    id           = auth0_action.sync_feide_name.id
    display_name = auth0_action.sync_feide_name.name
  }
}
