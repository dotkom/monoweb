# Terraform Module AWS Lightsail Container Service

Provision an AWS Lightsail Container Service with a public endpoint and SSL certificate from a provided ECR repository.

## Cost Estimate

The primary cost of this module is the Lightsail container service, which is billed based on the number of hours the
service is running, and the compute tier of the service. In addition, there are also data transfer costs.

Please see the [AWS Lightsail pricing page](https://aws.amazon.com/lightsail/pricing/) for more information.

## Caveats

The Lightsail terraform resource for certificates accept a list of subject alternative names in addition to the primary
domain name. However, because the returned domain validation options from the certificate resource are not known at the
time of Terraform planning, we cannot create the Route53 records for the certificate in the same Terraform run.

This means that the certificate must be created in a separate Terraform run from the Route53 records. This is why we have
separated the certificate and the Route53 records into two separate modules.

Please refer to the example below for how to use this module in conjunction with the `aws-lightsail-certificate` module.

```bash
# First, we need to create the certificate
terraform apply -target=module.gradestats_server_certificate

# Then we attempt to create the container service and Route53 records
terraform apply

# This might fail, because the certificate is not yet validated. If it does, we can simply re-apply after a few minutes
# of waiting for AWS to validate the certificate.
terraform apply
```

## Example

```hcl
module "gradestats_server_certificate" {
  source = "../modules/aws-lightsail-certificate"

  certificate_name = "grades-server-${terraform.workspace}"
  public_domain_name = local.api_public_domain_name
  tags = {
    Project     = "grades-lightsail"
    Environment = terraform.workspace
  }
}

module "gradestats_server" {
  source = "../modules/aws-lightsail-container-service"

  dns_zone_id           = data.aws_route53_zone.grades.zone_id
  public_domain_name    = local.api_public_domain_name
  service_name          = "gradestats-server-${terraform.workspace}"
  environment_variables = data.doppler_secrets.grades.map
  image_tag             = "0.1.1"

  certificate_domain_validation_options = module.gradestats_server_certificate.certificate_domain_validation_options
  certificate_name = module.gradestats_server_certificate.certificate_name

  container_port = 8081
  tags = {
    Project     = "grades-lightsail"
    Environment = terraform.workspace
  }
}
```
