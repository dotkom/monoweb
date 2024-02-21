locals {
  gateway_domain_name = "${terraform.workspace}.gateway.online.ntnu.no"
}

module "api_gateway_domain_certificate" {
  source = "../modules/aws-acm-certificate"

  domain  = local.gateway_domain_name
  zone_id = local.zone_id

  tags = {
    Project     = "monoweb"
    Environment = terraform.workspace
  }

  providers = {
    aws.regional = aws.eu-north-1
  }
}

module "api_gateway" {
  source = "../modules/aws-api-gateway"

  domain          = local.gateway_domain_name
  zone_id         = local.zone_id
  certificate_arn = module.api_gateway_domain_certificate.certificate_arn

  tags = {
    Project     = "monoweb"
    Environment = terraform.workspace
  }
}


# ---------------------------------------------------------------------------------------------------------------------
# Connect Gateway Email to API Gateway
# ---------------------------------------------------------------------------------------------------------------------

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = module.api_gateway.api_gateway_id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = module.email_lambda.lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "lambda" {
  api_id    = module.api_gateway.api_gateway_id
  route_key = "POST /integrations/email"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "email_gateway" {
  statement_id  = "APIGatewayExecuteLambda"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  function_name = module.email_lambda.lambda_name
  source_arn    = "${module.api_gateway.api_gateway_execution_arn}/*/*"
}
