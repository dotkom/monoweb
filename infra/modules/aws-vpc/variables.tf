variable "private_subnets" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
}

variable "public_subnets" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
}

variable "availability_zones" {
  description = "List of AWS Availability Zones to expose to"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = object({})
}
