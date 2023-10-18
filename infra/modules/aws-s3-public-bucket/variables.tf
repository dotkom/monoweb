variable "domain_name" {
  description = "Domain name to host the CDN on"
  type        = string
}

variable "certificate_arn" {
  description = "ACM Certificate ARN"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = object({})
}
