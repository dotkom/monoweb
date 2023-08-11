terraform {
  backend "s3" {
    bucket = "monoweb-infra"
    key    = "neon"
    region = "eu-north-1"
  }

  required_version = "~> 1.5.4"

  required_providers {
    neon = {
      source  = "terraform-community-providers/neon"
      version = "~> 0.1.4"
    }
  }
}
