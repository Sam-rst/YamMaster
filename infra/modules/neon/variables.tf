variable "project_name" {
  description = "Nom du projet Neon"
  type        = string
}

variable "region" {
  description = "Region Neon (aws-eu-central-1 = Francfort)"
  type        = string
  default     = "aws-eu-central-1"
}

variable "branch_name" {
  description = "Nom de la branche Neon"
  type        = string
  default     = "main"
}

variable "database_name" {
  description = "Nom de la base de donnees"
  type        = string
  default     = "yammaster"
}

variable "role_name" {
  description = "Nom du role PostgreSQL"
  type        = string
  default     = "yammaster"
}
