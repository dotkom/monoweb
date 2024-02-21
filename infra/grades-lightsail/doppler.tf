data "doppler_secrets" "grades" {
  project = "grades"
  config  = terraform.workspace

  provider = doppler.grades
}
