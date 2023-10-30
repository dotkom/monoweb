variable "pool_name" {
  description = "Name of the Cognito user pool"
  type        = string
}

variable "schema" {
  description = "Cognito user pool attributes schema"
  type        = list(any)
}

variable "custom_domain" {
  description = "Custom domain name to host the Cognito application at"
  type        = string
}

variable "certificate_arn" {
  description = "AWS ARN of ACM Certificate to use"
  type        = string
}

variable "zone_id" {
  description = "Route53 Zone ID of DNS Zone where the custom domain is registered"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = object({})
}
