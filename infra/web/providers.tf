provider "aws" {
  region = "eu-north-1"

  default_tags {
    tags = {
      Project     = "monoweb"
      Environment = terraform.workspace
    }
  }
}

provider "aws" {
  alias  = "eu-north-1"
  region = "eu-north-1"

  default_tags {
    tags = {
      Project     = "monoweb"
      Environment = terraform.workspace
    }
  }
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "monoweb"
      Environment = terraform.workspace
    }
  }
}

provider "vercel" {
  team = "dotkom"
}

variable "doppler_token_monoweb" {
  description = "TF Variable for the monoweb doppler token"
  type        = string
}

provider "doppler" {
  doppler_token = var.doppler_token_monoweb
  alias         = "monoweb"
}

variable "doppler_token_vengeful" {
  description = "TF Variable for the vengeful doppler token"
  type        = string
}

provider "doppler" {
  doppler_token = var.doppler_token_vengeful
  alias         = "vengeful"
}

provider "neon" {}
