data "doppler_secrets" "monoweb" {
  config  = terraform.workspace
  project = "monoweb"
}

locals {
  aws_safe_doppler_secrets = {
    for key, value in data.doppler_secrets.monoweb.map : key => value if !contains(["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"], key)
  }
}
