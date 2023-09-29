variable "user_pool_id" {
  description = "Cognito user pool to create client for"
  type        = string
}

variable "client_name" {
  description = "Cognito user pool client name"
  type        = string
}

variable "callback_urls" {
  description = "Valid callback urls for this client"
  type        = list(string)
}
