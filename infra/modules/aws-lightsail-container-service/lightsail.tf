resource "aws_lightsail_container_service" "this" {
  name  = var.service_name
  power = var.provision_power
  scale = var.max_scaling

  public_domain_names {
    certificate {
      certificate_name = var.certificate_name
      domain_names = [
        var.public_domain_name,
      ]
    }
  }

  private_registry_access {
    ecr_image_puller_role {
      is_active = true
    }
  }

  tags = var.tags

  depends_on = [aws_route53_record.certificate]
}

resource "aws_lightsail_container_service_deployment_version" "this" {
  service_name = aws_lightsail_container_service.this.name

  container {
    container_name = "${var.service_name}-container"
    image          = "${module.gradestats_app_repository.ecr_repository_url}:${var.image_tag}"
    environment    = var.environment_variables
    ports = {
      (var.container_port) = "HTTP"
    }
  }

  public_endpoint {
    container_name = "${var.service_name}-container"
    container_port = var.container_port

    health_check {
      healthy_threshold   = 2
      unhealthy_threshold = 10
      timeout_seconds     = var.healthcheck_timeout
      interval_seconds    = 30
      path                = "/"
      success_codes       = "200-499"
    }
  }
}
