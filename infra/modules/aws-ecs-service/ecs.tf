resource "aws_ecs_cluster" "this" {
  name = var.cluster_name

  tags = var.tags
}

resource "aws_ecs_cluster_capacity_providers" "this_fargate" {
  cluster_name = aws_ecs_cluster.this.name
  capacity_providers = ["FARGATE"]
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    # Launch at minimum zero tasks from Fargate
    base = 0
    # But all tasks launched, are to be launched from Fargate
    weight = 100
  }
}

resource "aws_ecs_task_definition" "this" {
  family                = var.service_name
  requires_compatibilities = ["FARGATE"]
  network_mode = "awsvpc"
  cpu = 512
  memory = 2048

  container_definitions = jsonencode(var.container_definitions)
}

resource "aws_ecs_service" "this" {
  name = var.service_name

  desired_count = var.desired_count
  cluster = aws_ecs_cluster.this.id

  force_new_deployment = true
  task_definition = aws_ecs_task_definition.this.id
  iam_role = aws_iam_role.ecs.arn

  scheduling_strategy = "REPLICA"
  launch_type = "FARGATE"

  network_configuration {
    subnets = var.subnets
    security_groups = var.security_groups
    assign_public_ip = true
  }

  load_balancer {
    container_name = var.container_name
    container_port = var.container_port
    target_group_arn = var.load_balancer_target_group
  }

  tags = var.tags
}
