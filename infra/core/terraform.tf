terraform {
  backend "s3" {
    bucket = "monoweb-terraform"
    key    = "core.tfstate"
    region = "eu-north-1"
  }

  required_version = "~> 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.33"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.16"
    }
  }
}

locals {
  # This module only has the production environment, as this module provisions core infrastructure independent of
  # environments
  valid_workspaces = {
    prd = 1
  }
  valid_workspaces_current = local.valid_workspaces[terraform.workspace]
}
