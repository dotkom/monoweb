resource "aws_ecs_cluster" "this" {
  name = var.cluster_name

  tags = var.tags
}

resource "aws_ecs_cluster_capacity_providers" "this_fargate" {
  cluster_name       = aws_ecs_cluster.this.name
  capacity_providers = ["FARGATE"]
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    # Launch at minimum zero tasks from Fargate
    base = 0
    # But all tasks launched, are to be launched from Fargate
    weight = 100
  }
}

data "aws_iam_policy_document" "ecs" {
  statement {
    effect = "Allow"
    principals {
      type = "Service"
      identifiers = [
        "ecs-tasks.amazonaws.com",
        "ecs.amazonaws.com"
      ]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "ecs" {
  assume_role_policy = data.aws_iam_policy_document.ecs.json
  name               = "${var.cluster_name}-ecs-role"
}

resource "aws_ecs_task_definition" "this" {
  family                   = var.service_name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 2048
  memory                   = 4096
  execution_role_arn       = "arn:aws:iam::891459268445:role/ecsTaskExecutionRole"
  task_role_arn            = aws_iam_role.ecs.arn

  container_definitions = jsonencode(var.container_definitions)

  tags = var.tags
}

resource "aws_ecs_service" "this" {
  name = var.service_name

  desired_count = var.desired_count
  cluster       = aws_ecs_cluster.this.id

  force_new_deployment = true
  task_definition      = aws_ecs_task_definition.this.id

  scheduling_strategy = "REPLICA"
  launch_type         = "FARGATE"

  network_configuration {
    subnets          = var.subnets
    security_groups  = var.security_groups
    assign_public_ip = true
  }

  load_balancer {
    container_name   = var.container_name
    container_port   = var.container_port
    target_group_arn = var.load_balancer_target_group
  }

  tags = var.tags
}
