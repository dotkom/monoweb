locals {
  forbidden_aws_lambda_keys = [
    "AWS_REGION",
    "AWS_DEFAULT_REGION",
    "AWS_ACCESS_KEY",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_SESSION_TOKEN"
  ]

  vengeful_aws_safe_doppler_secrets = {
    for key, value in data.doppler_secrets.vengeful.map : key => value if !contains(local.forbidden_aws_lambda_keys, key)
  }
}

data "doppler_secrets" "vengeful" {
  project = "vengeful-vineyard"
  config  = terraform.workspace

  provider = doppler.vengeful
}
