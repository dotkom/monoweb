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

variable "doppler_token" {
  description = "TF Variable for the doppler token"
  type        = string
}

provider "doppler" {
  doppler_token = var.doppler_token
}
