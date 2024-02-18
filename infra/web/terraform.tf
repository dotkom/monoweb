terraform {
  backend "s3" {
    bucket = "monoweb-terraform"
    key    = "infra.tfstate"
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
    doppler = {
      source  = "DopplerHQ/doppler"
      version = "~> 1.3.0"
    }
    neon = {
      source  = "dotkom/neon"
      version = "~> 0.1.1"
    }
  }
}

locals {
  valid_workspaces = {
    dev = 1
    prd = 1
  }
  valid_workspaces_current = local.valid_workspaces[terraform.workspace]
}
