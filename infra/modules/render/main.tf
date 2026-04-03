terraform {
  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.0"
    }
  }
}

resource "render_web_service" "backend" {
  name            = var.service_name
  plan            = var.plan
  region          = var.region
  runtime         = "node"
  build_command   = "cd backend && npm ci --legacy-peer-deps && npx prisma generate && npm run build"
  start_command   = "cd backend && npm run start"
  repo_url        = var.repo_url
  branch          = var.branch
  auto_deploy     = true

  env_vars = merge(
    {
      NODE_ENV        = var.environment
      PORT            = "3000"
      DATABASE_URL    = var.database_url
      ALLOWED_ORIGINS = var.allowed_origins
      DEV_MODE        = var.dev_mode
    },
    var.extra_env_vars
  )
}
