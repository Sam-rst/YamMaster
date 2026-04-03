variable "render_api_key" {
  description = "Cle API Render (https://dashboard.render.com/u/settings#api-keys)"
  type        = string
  sensitive   = true
}

variable "neon_api_key" {
  description = "Cle API Neon (https://console.neon.tech/app/settings/api-keys)"
  type        = string
  sensitive   = true
}

variable "repo_url" {
  description = "URL du repo GitHub"
  type        = string
  default     = "https://github.com/Sam-rst/YamMaster"
}

variable "allowed_origins" {
  description = "Origines CORS autorisees (separees par virgules)"
  type        = string
  default     = ""
}
