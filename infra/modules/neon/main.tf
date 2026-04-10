terraform {
  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.6"
    }
  }
}

# --- Projet unique ---
resource "neon_project" "this" {
  name                      = var.project_name
  region_id                 = var.region
  history_retention_seconds = 21600
}

# --- Branche main (par defaut) : endpoint + role + database ---
resource "neon_endpoint" "main" {
  project_id = neon_project.this.id
  branch_id  = neon_project.this.default_branch_id
  type       = "read_write"
}

resource "neon_role" "main" {
  project_id = neon_project.this.id
  branch_id  = neon_project.this.default_branch_id
  name       = var.role_name

  depends_on = [neon_endpoint.main]
}

resource "neon_database" "main" {
  project_id = neon_project.this.id
  branch_id  = neon_project.this.default_branch_id
  name       = var.database_name
  owner_name = neon_role.main.name
}

# --- Branches supplementaires (for_each) ---
resource "neon_branch" "extra" {
  for_each   = toset(var.branches)
  project_id = neon_project.this.id
  name       = each.key
}

resource "neon_endpoint" "extra" {
  for_each   = toset(var.branches)
  project_id = neon_project.this.id
  branch_id  = neon_branch.extra[each.key].id
  type       = "read_write"
}

resource "neon_role" "extra" {
  for_each   = toset(var.branches)
  project_id = neon_project.this.id
  branch_id  = neon_branch.extra[each.key].id
  name       = var.role_name

  depends_on = [neon_endpoint.extra]
}

resource "neon_database" "extra" {
  for_each   = toset(var.branches)
  project_id = neon_project.this.id
  branch_id  = neon_branch.extra[each.key].id
  name       = var.database_name
  owner_name = neon_role.extra[each.key].name
}
