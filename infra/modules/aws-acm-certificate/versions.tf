terraform {
  required_version = "~> 1.5.7"

  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 5.19"
      configuration_aliases = [aws.us-east-1]
    }
  }
}
