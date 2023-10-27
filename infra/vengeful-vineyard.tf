locals {
  vengeful_project_name = "vengeful-vineyard-${terraform.workspace}"
  vengeful_domain_name  = "${terraform.workspace}.redwine.online.ntnu.no"
}

module "vengeful_database" {
  source = "./modules/neon-project"

  project_name = local.vengeful_project_name
  role_name    = "vengeful"
}

module "vengeful_lambda" {
  source = "./modules/aws-docker-lambda"

  ecr_repository_name   = "vengeful-vineyard-${terraform.workspace}"
  function_name         = "vengeful-vineyard-${terraform.workspace}"
  execution_role_name   = "VengefulVineytardExecutionRole${title(terraform.workspace)}"
  iam_inline_policies   = []
  environment_variables = {}

  tags = {
    Project     = "vengeful-vineyard"
    Environment = terraform.workspace
  }
}

module "vengeful_gateway_domain_certificate" {
  source = "./modules/aws-acm-certificate"

  domain  = local.vengeful_domain_name
  zone_id = local.zone_id

  tags = {
    Project     = "vengeful-vineyard"
    Environment = terraform.workspace
  }

  providers = {
    aws.regional = aws.eu-north-1
  }
}

module "vengeful_gateway_proxy" {
  source = "./modules/aws-api-gateway"

  domain          = local.vengeful_domain_name
  zone_id         = local.zone_id
  certificate_arn = module.vengeful_gateway_domain_certificate.certificate_arn

  tags = {
    Project     = "vengeful-vineyard"
    Environment = terraform.workspace
  }
}

# ---------------------------------------------------------------------------------------------------------------------
# Connect backend lambda to API Gateway
# ---------------------------------------------------------------------------------------------------------------------

resource "aws_apigatewayv2_integration" "vengeful_backend_lambda" {
  api_id                 = module.vengeful_gateway_proxy.api_gateway_id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = module.vengeful_lambda.lambda_invoke_arn
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_route" "vengeful_backend_lambda" {
  api_id    = module.vengeful_gateway_proxy.api_gateway_id
  route_key = "ANY /api/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.vengeful_backend_lambda.id}"
}

resource "aws_lambda_permission" "vengeful_backend_gateway_lambda" {
  statement_id  = "APIGatewayExecuteLambda"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  function_name = module.vengeful_lambda.lambda_name
  source_arn    = "${module.vengeful_gateway_proxy.api_gateway_execution_arn}/*/*"
}
