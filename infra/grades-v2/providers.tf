provider "aws" {
  region = "eu-north-1"

  default_tags {
    tags = {
      Project     = "grades_v2"
      Environment = terraform.workspace
    }
  }
}


provider "aws" {
  alias  = "eu-north-1"
  region = "eu-north-1"

  default_tags {
    tags = {
      Project     = "grades_v2"
      Environment = terraform.workspace
    }
  }
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "grades_v2"
      Environment = terraform.workspace
    }
  }
}

provider "neon" {}
