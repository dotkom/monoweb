variable "cluster_name" {
  description = "ECS Cluster name"
  type        = string
}

variable "service_name" {
  description = "ECS Service name"
  type        = string
}

variable "desired_count" {
  description = "Desired instance count of service"
  type        = number
  default     = 1
}

variable "security_groups" {
  description = "Target security group"
  type        = list(string)
}

variable "container_name" {
  description = "Name of the container"
  type        = string
}

variable "container_port" {
  description = "Port on which to associate with the container"
}

variable "subnets" {
  description = "Subnets in VPC to connect to"
  type        = list(string)
}

variable "load_balancer_target_group" {
  description = "Load balancer target group ARN"
  type        = string
}

variable "container_definitions" {
  description = "ECS Container Definitions"
  type        = list(any)
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = object({})
}
