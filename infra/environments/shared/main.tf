terraform {
  required_version = ">= 1.5"

  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.6"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
  }
}

provider "neon" {
  api_key = var.neon_api_key
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id
}

# --- Base de donnees (Neon) ---
module "database" {
  source = "../../modules/neon"

  project_name  = "yammaster"
  region        = "aws-eu-central-1"
  branches      = ["preview"]
  database_name = "yammaster"
  role_name     = "yammaster"
}

# --- Frontend (Vercel) ---
module "frontend" {
  source = "../../modules/vercel"

  project_name      = "yammaster"
  team_id           = var.vercel_team_id
  github_repo       = "Sam-rst/YamMaster"
  production_branch = "main"
  root_directory    = "frontend"
  build_command     = "npm ci --legacy-peer-deps && npm run build"
  output_directory  = "dist"

  environment_variables = [
    # --- Preview ---
    {
      key    = "EXPO_PUBLIC_SERVER_URL"
      value  = var.backend_url_preview
      target = ["preview"]
    },
    # --- Production ---
    {
      key    = "EXPO_PUBLIC_SERVER_URL"
      value  = var.backend_url_prod
      target = ["production"]
    },
  ]
}
