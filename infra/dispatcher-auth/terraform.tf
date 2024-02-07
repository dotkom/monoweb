terraform {
  backend "s3" {
    bucket = "monoweb-terraform"
    key    = "dispatcher-auth.tfstate"
    region = "eu-north-1"
  }

  required_version = "~> 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.23"
    }
    doppler = {
      source  = "DopplerHQ/doppler"
      version = "~> 1.3.0"
    }
  }
}

locals {
  # This module only has the production environment, as this module provisions core infrastructure independent of
  # environments
  valid_workspaces = {
    dev = 1
    prd = 1
  }
  valid_workspaces_current = local.valid_workspaces[terraform.workspace]
}
