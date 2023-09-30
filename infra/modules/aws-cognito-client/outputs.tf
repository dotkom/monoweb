output "client_id" {
  value = aws_cognito_user_pool_client.this.id
}

output "client_secret" {
  value = aws_cognito_user_pool_client.this.client_secret
}
