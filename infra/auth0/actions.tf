resource "auth0_action" "disallow_ntnu_mail" {
  name    = "Disallow NTNU-mail"
  runtime = "node18"
  deploy  = true
  code    = file("${path.module}/js/actions/disallowNTNUMail.js")

  supported_triggers {
    id      = "pre-user-registration"
    version = "v2"
  }

  count = terraform.workspace == "prd" ? 1 : 0
}

resource "auth0_trigger_action" "disallow_ntnu_mail" {
  trigger   = "pre-user-registration"
  action_id = auth0_action.disallow_ntnu_mail[0].id
  count = terraform.workspace == "prd" ? 1 : 0
}
