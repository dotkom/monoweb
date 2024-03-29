provider "aws" {
  region = "eu-north-1"

  default_tags {
    tags = {
      Project     = "grades-lightsail"
      Environment = terraform.workspace
    }
  }
}


provider "aws" {
  alias  = "eu-north-1"
  region = "eu-north-1"

  default_tags {
    tags = {
      Project     = "grades-lightsail"
      Environment = terraform.workspace
    }
  }
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "grades-lightsail"
      Environment = terraform.workspace
    }
  }
}

variable "doppler_token_grades" {
  description = "TF Variable for the grades doppler token"
  type        = string
}

provider "doppler" {
  doppler_token = var.doppler_token_grades
  alias         = "grades"
}

