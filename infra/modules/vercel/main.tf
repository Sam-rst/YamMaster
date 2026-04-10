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

  git_repository = {
    type              = "github"
    repo              = var.github_repo
    production_branch = var.production_branch
  }

  build_command    = var.build_command
  output_directory = var.output_directory
  root_directory   = var.root_directory

  # Desactive les commentaires Git automatiques de Vercel
  git_comments = {
    on_commit       = false
    on_pull_request = false
  }

  # Variables d'environnement
  environment = var.environment_variables
}
