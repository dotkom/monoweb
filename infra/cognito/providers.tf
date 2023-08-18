provider "aws" {
  region = "eu-north-1"

  default_tags {
    tags = {
      Project     = "Monoweb"
      Module      = "cognito"
      Environment = terraform.workspace
    }
  }
}
