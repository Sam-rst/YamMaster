terraform {
  required_version = ">= 1.5"

  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.0"
    }
  }
}

provider "render" {
  api_key  = var.render_api_key
  owner_id = var.render_owner_id
}

module "backend" {
  source = "../../modules/render"

  service_name    = "yammaster-preview"
  plan            = "free"
  region          = "frankfurt"
  repo_url        = var.repo_url
  branch          = "preview"
  database_url    = var.database_url
  allowed_origins = var.allowed_origins
  environment     = "preview"
  dev_mode        = "false"
}
