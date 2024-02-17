


resource "auth0_email_provider" "amazon_ses_email_provider" {
  name                 = "ses"
  enabled              = true
  default_from_address = "online@online.ntnu.no"

  credentials {
    access_key_id     = aws_iam_access_key.auth0_ses_emailer.id
    secret_access_key = aws_iam_access_key.auth0_ses_emailer.secret
    region            = data.aws_region.current.name
  }
}

resource "aws_iam_user" "auth0_ses_emailer" {
  name = "auth0_ses_emailer-${terraform.workspace}"
  path = "/auth0_ses_emailer/"
}

resource "aws_ses_domain_identity" "online_ntnu_no" {
  domain = "online.ntnu.no"
}

resource "aws_iam_access_key" "auth0_ses_emailer" {
  user = aws_iam_user.auth0_ses_emailer.name
}

data "aws_iam_policy_document" "auth0_ses_policy" {
  statement {
    actions = [
      "SES:SendEmail",
      "SES:SendRawEmail"
    ]
    resources = [
      aws_ses_domain_identity.online_ntnu_no.arn
    ]
  }
}

resource "aws_iam_user_policy" "auth0_ses_ro" {
  user   = aws_iam_user.auth0_ses_emailer.name
  policy = data.aws_iam_policy_document.auth0_ses_policy.json
}