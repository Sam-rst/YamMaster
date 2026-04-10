terraform {
  required_version = ">= 1.5"

  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.0"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.6"
    }
  }
}

provider "render" {
  api_key  = var.render_api_key
  owner_id = var.render_owner_id
}

provider "neon" {
  api_key = var.neon_api_key
}

# --- Base de donnees Neon ---
module "database" {
  source = "../../modules/neon"

  project_name  = "yammaster-prod"
  region        = "aws-eu-central-1"
  branch_name   = "main"
  database_name = "yammaster"
  role_name     = "yammaster"
}

# --- Backend Render ---
module "backend" {
  source = "../../modules/render"

  service_name    = "yammaster-prod"
  plan            = "free"
  region          = "frankfurt"
  repo_url        = var.repo_url
  branch          = "main"
  database_url    = module.database.connection_uri
  allowed_origins = var.allowed_origins
  environment     = "production"
  dev_mode        = "false"
}
