terraform {
  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.0"
    }
  }
}

resource "render_web_service" "backend" {
  name          = var.service_name
  plan          = var.plan
  region        = var.region
  start_command = var.start_command

  lifecycle {
    ignore_changes = [maintenance_mode]
  }

  runtime_source = {
    native_runtime = {
      repo_url      = var.repo_url
      branch        = var.branch
      runtime       = "node"
      build_command = var.build_command
      auto_deploy   = false
    }
  }

  env_vars = {
    "NODE_ENV"        = { value = var.environment }
    "PORT"            = { value = "3000" }
    "DATABASE_URL"    = { value = var.database_url }
    "ALLOWED_ORIGINS" = { value = var.allowed_origins }
    "DEV_MODE"        = { value = var.dev_mode }
  }
}
