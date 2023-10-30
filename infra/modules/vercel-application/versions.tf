terraform {
  required_version = "~> 1.6.2"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.23"
    }
  }
}
