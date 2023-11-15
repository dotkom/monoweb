terraform {
  required_version = "~> 1.6.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.23"
      configuration_aliases = [aws.regional]
    }
  }
}
