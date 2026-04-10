variable "render_api_key" {
  description = "Cle API Render"
  type        = string
  sensitive   = true
}

variable "render_owner_id" {
  description = "Owner ID Render (https://dashboard.render.com/u/settings → Owner ID)"
  type        = string
}

variable "neon_api_key" {
  description = "Cle API Neon"
  type        = string
  sensitive   = true
}

variable "repo_url" {
  description = "URL du repo GitHub"
  type        = string
  default     = "https://github.com/Sam-rst/YamMaster"
}

variable "allowed_origins" {
  description = "Origines CORS autorisees en production"
  type        = string
}
