data "aws_iam_policy_document" "ses_send_email" {
  statement {
    sid       = "GatewayEmailSendSES"
    effect    = "Allow"
    actions   = ["ses:SendEmail"]
    resources = ["*"]
  }
}

resource "aws_secretsmanager_secret" "email_token" {
  name = "gateway-email/token"
}

data "aws_secretsmanager_secret_version" "email_token" {
  secret_id = aws_secretsmanager_secret.email_token.id
}

module "email_lambda" {
  source = "../modules/aws-docker-lambda"

  ecr_repository_name = "gateway-email-${terraform.workspace}"
  function_name       = "gateway-email-${terraform.workspace}"
  execution_role_name = "GatewayEmailExecuteRole${title(terraform.workspace)}"
  iam_inline_policies = [
    {
      name   = "SESSendEmail"
      policy = data.aws_iam_policy_document.ses_send_email.json
    }
  ]
  environment_variables = {
    EMAIL_TOKEN = data.aws_secretsmanager_secret_version.email_token.secret_string
  }

  tags = {
    Project     = "monoweb"
    Environment = terraform.workspace
  }
}
