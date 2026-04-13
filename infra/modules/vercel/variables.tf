variable "project_name" {
  description = "Nom du projet Vercel"
  type        = string
}

variable "team_id" {
  description = "ID de l'equipe Vercel (null pour un compte personnel)"
  type        = string
  default     = null
}

variable "github_repo" {
  description = "Repo GitHub au format owner/repo"
  type        = string
}

variable "root_directory" {
  description = "Repertoire racine du frontend dans le repo"
  type        = string
  default     = "frontend"
}

variable "build_command" {
  description = "Commande de build"
  type        = string
  default     = "npm ci --legacy-peer-deps && npm run build"
}

variable "output_directory" {
  description = "Repertoire de sortie du build"
  type        = string
  default     = "dist"
}

variable "production_branch" {
  description = "Branche Git de production"
  type        = string
  default     = "main"
}

variable "environment_variables" {
  description = "Variables d'environnement du projet Vercel"
  type = set(object({
    key    = string
    value  = string
    target = set(string)
  }))
  default = []
}
