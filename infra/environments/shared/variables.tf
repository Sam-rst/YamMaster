variable "neon_api_key" {
  description = "Cle API Neon (https://console.neon.tech/app/settings/api-keys)"
  type        = string
  sensitive   = true
}

variable "vercel_api_token" {
  description = "Token API Vercel (https://vercel.com/account/tokens)"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "ID de l'equipe Vercel (null pour un compte personnel)"
  type        = string
  default     = null
}

variable "backend_url_preview" {
  description = "URL du backend preview (ex: https://yammaster-preview.onrender.com)"
  type        = string
}

variable "backend_url_prod" {
  description = "URL du backend production (ex: https://yammaster-prod.onrender.com)"
  type        = string
}
