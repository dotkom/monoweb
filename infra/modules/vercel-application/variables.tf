variable "project_name" {
  description = "Vercel project name"
  type        = string
}

variable "domain_name" {
  description = "Domain name to assign to the project"
  type        = string
}

variable "zone_id" {
  description = "Route53 Zone ID of DNS Zone where the custom domain is registered"
  type        = string
}

variable "build_command" {
  description = "Command to run to build project"
  type        = string
}

variable "root_directory" {
  description = "Location in repository where app root is found"
  type        = string
}

variable "environment_variables" {
  description = "Environment variables to the provisioned website"
  type = map(string)
  default = {}
}

variable "preset" {
  description = "Vercel preset"
  type        = string
  default     = "nextjs"
}
