terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
  }
}

# --- Projet Vercel ---
resource "vercel_project" "frontend" {
  name      = var.project_name
  framework = null
  team_id   = var.team_id

  # Pas de git_repository — déploiement uniquement via CI (vercel deploy --prebuilt)

  build_command    = var.build_command
  output_directory = var.output_directory
  root_directory   = var.root_directory

  # Désactive la protection d'accès sur les preview deployments
  vercel_authentication = {
    deployment_type = "none"
  }

  # Variables d'environnement
  environment = var.environment_variables
}
