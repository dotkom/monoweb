terraform {
  backend "s3" {
    bucket = "monoweb-infra"
    key    = "cognito"
    region = "eu-north-1"
  }

  required_version = "~> 1.5.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.18"
    }
  }
}
