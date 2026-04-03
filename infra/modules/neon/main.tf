terraform {
  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.6"
    }
  }
}

resource "neon_project" "this" {
  name                      = var.project_name
  region_id                 = var.region
  history_retention_seconds = 21600
}

resource "neon_branch" "this" {
  project_id = neon_project.this.id
  name       = var.branch_name
}

resource "neon_endpoint" "this" {
  project_id = neon_project.this.id
  branch_id  = neon_branch.this.id
  type       = "read_write"
}

resource "neon_role" "this" {
  project_id = neon_project.this.id
  branch_id  = neon_branch.this.id
  name       = var.role_name

  depends_on = [neon_endpoint.this]
}

resource "neon_database" "this" {
  project_id = neon_project.this.id
  branch_id  = neon_branch.this.id
  name       = var.database_name
  owner_name = neon_role.this.name
}
