terraform {
  backend "s3" {
    bucket = "monoweb-terraform"
    key    = "auth0.tfstate"
    region = "eu-north-1"
  }

  required_version = "~> 1.16.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.44"
    }
    doppler = {
      source  = "DopplerHQ/doppler"
      version = "~> 1.21.2"
    }
    auth0 = {
      source  = "auth0/auth0"
      version = "~> 1.45.0"
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
