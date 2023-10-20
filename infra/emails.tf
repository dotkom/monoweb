data "aws_iam_policy_document" "ses_send_email" {
  statement {
    sid = "GatewayEmailSendSES"
    effect = "Allow"
    actions = ["ses:SendMail"]
    resources = ["*"]
  }
}

module "email_lambda" {
  source = "./modules/aws-docker-lambda"

  ecr_repository_name = "gateway-email-${terraform.workspace}"
  function_name = "gateway-email-${terraform.workspace}"
  execution_role_name = "GatewayEmailExecuteRole${title(terraform.workspace)}"
  iam_inline_policies = [
    {
      name = "SESSendEmail"
      policy = data.aws_iam_policy_document.ses_send_email.json
    }
  ]

  tags = {
    Project     = "monoweb"
    Environment = terraform.workspace
  }
}