terraform {
  backend "s3" {
    bucket = "monoweb-infra"
    key    = "vercel-monoweb"
    region = "eu-north-1"
  }

  required_version = "~> 1.5.7"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15"
    }

    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.18"
    }
  }
}
