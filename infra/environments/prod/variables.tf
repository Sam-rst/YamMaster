variable "render_api_key" {
  description = "Cle API Render"
  type        = string
  sensitive   = true
}

variable "render_owner_id" {
  description = "Owner ID Render"
  type        = string
}

variable "repo_url" {
  description = "URL du repo GitHub"
  type        = string
  default     = "https://github.com/Sam-rst/YamMaster"
}

variable "database_url" {
  description = "URI de connexion PostgreSQL production (depuis shared/outputs)"
  type        = string
  sensitive   = true
}

variable "allowed_origins" {
  description = "Origines CORS autorisees en production"
  type        = string
}
