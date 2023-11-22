module "core_vpc" {
  source             = "../modules/aws-vpc"
  public_subnets     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets    = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]
  availability_zones = ["eu-north-1a", "eu-north-1b", "eu-north-1c"]

  tags = {
    Project     = "grades"
    Environment = terraform.workspace
  }

  providers = {
    aws.regional = aws.eu-north-1
  }
}

module "gradestats_web" {
  source                     = "../modules/aws-ecs-service"
  service_name               = "gradestats-web-${terraform.workspace}"
  cluster_name               = "gradestats-web-${terraform.workspace}"
  container_name             = "gradestats_web"
  container_port             = 3000
  security_groups            = [module.core_vpc.default_security_group]
  subnets                    = module.core_vpc.public_subnets
  load_balancer_target_group = aws_lb_target_group.gradestats_web.arn

  container_definitions = [
    {
      name   = "gradestats_web"
      cpu    = 512
      memory = 2048
      image  = "${aws_ecrpublic_repository.gradestats_app.repository_uri}:0.1.0"
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      environment = sensitive([
        for key, value in data.doppler_secrets.grades.map : {
          name  = key
          value = value
        }
      ])
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs_log.name
          awslogs-region        = "eu-north-1"
          awslogs-stream-prefix = "awslogs-gradestats-web"
        }
      }
    }
  ]

  tags = {
    tags = {
      Project     = "grades"
      Environment = terraform.workspace
    }
  }
}

module "gradestats_app" {
  source                     = "../modules/aws-ecs-service"
  service_name               = "gradestates-app-${terraform.workspace}"
  cluster_name               = "gradestats-app-${terraform.workspace}"
  container_name             = "gradestats_app"
  container_port             = 8081
  security_groups            = [module.core_vpc.default_security_group]
  subnets                    = module.core_vpc.public_subnets
  load_balancer_target_group = aws_lb_target_group.gradestats_app.arn

  container_definitions = [
    {
      name   = "gradestats_app"
      cpu    = 512
      memory = 2048
      image  = "${aws_ecrpublic_repository.gradestats_web.repository_uri}:0.1.0"
      portMappings = [
        {
          containerPort = 8081
          hostPort      = 8081
          protocol      = "tcp"
        }
      ]
      environment = sensitive([
        for key, value in data.doppler_secrets.grades.map : {
          name  = key
          value = value
        }
      ])
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs_log.name
          awslogs-region        = "eu-north-1"
          awslogs-stream-prefix = "awslogs-gradestats-app"
        }
      }
    }
  ]

  tags = {
    Project     = "grades"
    Environment = terraform.workspace
  }
}
