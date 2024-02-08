variable "service_name" {
  description = "Name of the service"
  type        = string
}

variable "public_domain_name" {
  description = "Public domain name of the service"
  type        = string
}

variable "image_tag" {
  description = "Tag of the image to deploy"
  type        = string
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
}

variable "environment_variables" {
  description = "Environment variables to set for the service"
  type        = map(string)
}

variable "dns_zone_id" {
  description = "ID of the DNS zone the domain is managed in"
  type        = string
}

variable "provision_power" {
  description = "Provision power of the service"
  type        = string
  default     = "nano"
}

variable "max_scaling" {
  description = "Maximum number of instances"
  type        = number
  default     = 1
}

variable "certificate_name" {
  description = "Name of the certificate to use"
  type        = string
}

variable "certificate_domain_validation_options" {
  description = "Domain validation options for the certificate"
  type = set(object({
    domain_name           = string
    resource_record_name  = string
    resource_record_type  = string
    resource_record_value = string
  }))
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = object({})
}
