terraform {
  required_version = "~> 1.7.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.16"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.33"
    }
  }
}
