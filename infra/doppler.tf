data "doppler_secrets" "monoweb" {
  config = terraform.workspace
  project = "monoweb"
}
