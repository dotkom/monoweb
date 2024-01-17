resource "aws_cloudwatch_log_group" "ecs_log" {
  name = "/awslogs-gradestats-app-${terraform.workspace}"
}
