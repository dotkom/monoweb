resource "aws_cognito_user_pool" "this" {
  name                     = var.pool_name
  mfa_configuration        = "OFF"
  auto_verified_attributes = ["email"]

  user_pool_add_ons {
    advanced_security_mode = "OFF"
  }

  password_policy {
    minimum_length                   = 8
    temporary_password_validity_days = 3
  }

  username_attributes = ["email"]
  username_configuration {
    case_sensitive = true
  }

  dynamic "schema" {
    for_each = var.schema
    content {
      name                = lookup(schema.value, "name")
      attribute_data_type = lookup(schema.value, "attribute_data_type")
      mutable             = lookup(schema.value, "mutable")
      required            = lookup(schema.value, "required")
    }
  }

  lifecycle {
    ignore_changes = [schema]
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = var.tags
}

resource "aws_cognito_user_pool_domain" "this" {
  user_pool_id    = aws_cognito_user_pool.this.id
  domain          = var.custom_domain
  certificate_arn = var.certificate_arn
}
