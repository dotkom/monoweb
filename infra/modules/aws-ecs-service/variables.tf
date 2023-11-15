variable "cluster_name" {
  description = "ECS Cluster name"
  type = string
}

variable "service_name" {
  description = "ECS Service name"
  type = string
}

variable "desired_count" {
  description = "Desired instance count of service"
  type = number
  default = 1
}

variable "placement_constraints" {
  description = "Constraints for ECS Fargate task placement"
  type = object({
    type = string
    expression = string
  })
  default = {
    type       = "memberOf"
    expression = "attribute:ecs.availability-zone in [eu-north-1a, eu-north-1b, eu-north-1c]"
  }
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = object({})
}
