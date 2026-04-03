variable "service_name" {
  description = "Nom du service Render"
  type        = string
}

variable "plan" {
  description = "Plan Render (free, starter, standard)"
  type        = string
  default     = "free"
}

variable "region" {
  description = "Region Render"
  type        = string
  default     = "frankfurt"
}

variable "repo_url" {
  description = "URL du repo GitHub"
  type        = string
}

variable "branch" {
  description = "Branche Git a deployer"
  type        = string
}

variable "database_url" {
  description = "URL de connexion PostgreSQL"
  type        = string
  sensitive   = true
}

variable "allowed_origins" {
  description = "Origines CORS autorisees (separees par virgules)"
  type        = string
  default     = ""
}

variable "environment" {
  description = "Environnement (development, production)"
  type        = string
  default     = "development"
}

variable "dev_mode" {
  description = "Activer le mode developpeur"
  type        = string
  default     = "false"
}

variable "extra_env_vars" {
  description = "Variables d'environnement supplementaires"
  type        = map(string)
  default     = {}
}
