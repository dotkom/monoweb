terraform {
  backend "s3" {
    bucket = "monoweb-infra"
    key    = "neon"
    region = "eu-north-1"
  }

  required_version = "~> 1.5.4"

  required_providers {
    neon = {
      source  = "dotkom/neon"
      version = "~> 0.1.1"
    }
  }
}
