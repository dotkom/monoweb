resource "aws_ecrpublic_repository" "gradestats_app" {
  repository_name = "dotkom/gradestats-app"
  provider        = aws.us-east-1
}

resource "aws_ecrpublic_repository" "gradestats_web" {
  repository_name = "dotkom/gradestats-web"
  provider        = aws.us-east-1
}
