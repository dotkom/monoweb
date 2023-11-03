data "doppler_secrets" "rif" {
  project = "rif"
  config  = terraform.workspace

  provider = doppler.rif
}
