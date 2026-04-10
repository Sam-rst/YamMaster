output "project_id" {
  description = "ID du projet Neon"
  value       = neon_project.this.id
}

# --- Connection URIs ---
output "connection_uri_main" {
  description = "URI de connexion PostgreSQL branche main (production)"
  value       = "postgresql://${neon_role.main.name}:${neon_role.main.password}@${neon_endpoint.main.host}/${neon_database.main.name}?sslmode=require"
  sensitive   = true
}

output "connection_uris" {
  description = "URIs de connexion PostgreSQL par branche supplementaire"
  value = {
    for name in var.branches :
    name => "postgresql://${neon_role.extra[name].name}:${neon_role.extra[name].password}@${neon_endpoint.extra[name].host}/${neon_database.extra[name].name}?sslmode=require"
  }
  sensitive = true
}

# --- Hosts ---
output "host_main" {
  description = "Host de la branche main"
  value       = neon_endpoint.main.host
}

output "hosts" {
  description = "Hosts par branche supplementaire"
  value = {
    for name in var.branches :
    name => neon_endpoint.extra[name].host
  }
}
