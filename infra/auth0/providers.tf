terraform {
  backend "s3" {
    bucket = "monoweb-terraform"
    key    = "auth0.tfstate"
    region = "eu-north-1"
  }

  required_version = "~> 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.33"
    }
    doppler = {
      source  = "DopplerHQ/doppler"
      version = "~> 1.3.0"
    }
    auth0 = {
      source  = "auth0/auth0"
      version = "~> 1.1.0"
    }
  }
}

variable "DOPPLER_TOKEN_ALL" {
  description = "TF Variable for all auth0-projects"
  type        = string
}

provider "doppler" {
  doppler_token = var.DOPPLER_TOKEN_ALL
}

provider "auth0" {
  debug = true
}

provider "aws" {
  region = "eu-north-1"

  default_tags {
    tags = {
      Project     = "auth0"
      Environment = terraform.workspace
    }
  }
}

locals {
  valid_workspaces = {
    dev = 1
    stg = 1
    prd = 1
  }
  valid_workspaces_current = local.valid_workspaces[terraform.workspace]
}
