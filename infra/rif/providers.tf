provider "vercel" {
  team = "dotkom"
}

variable "doppler_token_rif" {
  description = "TF Variable for the rif doppler token"
  type        = string
}

provider "doppler" {
  doppler_token = var.doppler_token_rif
  alias         = "rif"
}
