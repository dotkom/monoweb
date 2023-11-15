resource "aws_ecrpublic_repository" "gradestats_app" {
  repository_name = "dotkom/gradestats-app"
  provider        = aws.us-east-1

  tags = {
    Project     = "grades"
    Environment = terraform.workspace
  }
}

resource "aws_ecrpublic_repository" "gradestats_web" {
  repository_name = "dotkom/gradestats-web"
  provider        = aws.us-east-1

  tags = {
    Project     = "grades"
    Environment = terraform.workspace
  }
}

module "gradestats_app" {
  source = "../modules/aws-ecs-service"
  service_name = "gradestates-app-${terraform.workspace }"

  cluster_name = "gradestats-app-${terraform.workspace}"
  tags = {
    Project     = "grades"
    Environment = terraform.workspace
  }
}
