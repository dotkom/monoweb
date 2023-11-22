module "core_alb" {
  source             = "../modules/aws-alb"
  security_groups    = [module.core_vpc.default_security_group]
  subnets            = module.core_vpc.public_subnets
  load_balancer_name = "load-balancer-${terraform.workspace}"

  tags = {
    Project     = "grades"
    Environment = terraform.workspace
  }
}

resource "aws_lb_target_group" "gradestats_app" {
  name        = "gradestats-app-${terraform.workspace}"
  port        = 8081
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = module.core_vpc.vpc_id
}

resource "aws_lb_listener" "gradestats_app" {
  load_balancer_arn = module.core_alb.alb_arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gradestats_web.arn
  }
}

resource "aws_lb_listener_rule" "gradestats_app" {
  listener_arn = aws_lb_listener.gradestats_app.arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gradestats_app.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

resource "aws_lb_target_group" "gradestats_web" {
  name        = "gradestats-web-${terraform.workspace}"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = module.core_vpc.vpc_id
}