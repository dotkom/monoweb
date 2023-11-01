resource "aws_apigatewayv2_api" "this" {
  name          = var.domain
  protocol_type = "HTTP"
  description   = "Main API Gateway for ${var.domain}"

  cors_configuration {
    allow_origins = ["https://${var.domain}"]
    allow_methods = ["GET", "HEAD", "POST"]
    allow_headers = ["*"]
  }

  tags = var.tags
}

resource "aws_apigatewayv2_domain_name" "this" {
  domain_name = var.domain
  domain_name_configuration {
    certificate_arn = var.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = var.tags
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  auto_deploy = true

  tags = var.tags
}

resource "aws_apigatewayv2_api_mapping" "this" {
  api_id      = aws_apigatewayv2_api.this.id
  domain_name = aws_apigatewayv2_domain_name.this.domain_name
  stage       = aws_apigatewayv2_stage.default.id
}
