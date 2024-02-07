module "post_signup_trigger_lambda" {
  source                = "../modules/aws-docker-lambda"
  ecr_repository_name   = "dispatcher-auth-${terraform.workspace}"
  function_name         = "dispatcher-auth-${terraform.workspace}"
  execution_role_name   = "DispatcherAuthExecuteRole${title(terraform.workspace)}"
  environment_variables = local.monoweb_aws_safe_doppler_secrets

  tags = {
    Project     = "monoweb"
    Environment = terraform.workspace
  }
}
