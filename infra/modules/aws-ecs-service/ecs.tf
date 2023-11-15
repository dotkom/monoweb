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
  container_definitions = jsonencode([])
}

resource "aws_ecs_service" "this" {
  name = var.service_name

  desired_count = var.desired_count
  cluster = aws_ecs_cluster.this.id

  force_new_deployment = true
  task_definition = aws_ecs_task_definition.this.id

  scheduling_strategy = "REPLICA"
  launch_type = "FARGATE"

  capacity_provider_strategy {
    capacity_provider = aws_ecs_cluster_capacity_providers.this_fargate.id
  }

  placement_constraints {
    type = var.placement_constraints.type
    expression = var.placement_constraints.expression
  }

  tags = var.tags
}
