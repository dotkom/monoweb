data "aws_cognito_user_pools" "user_pools" {
  name = "monoweb-${terraform.workspace}"
}
