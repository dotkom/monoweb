variable "load_balancer_name" {
  description = "Name for ALB"
  type        = string
}

variable "security_groups" {
  description = "Target security group"
  type        = list(string)
}

variable "subnets" {
  description = "Subnets in VPC to connect to"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = object({})
}
