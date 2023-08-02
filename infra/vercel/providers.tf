provider "aws" {
  region = "eu-north-1"

  default_tags {
    tags = {
      Project     = "Monoweb"
      Module      = "vercel"
      Environment = terraform.workspace
    }
  }
}

provider "vercel" {
  team = "dotkom"
}
