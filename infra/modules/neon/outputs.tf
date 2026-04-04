output "connection_uri" {
  description = "URI de connexion PostgreSQL (avec mot de passe)"
  value       = "postgresql://${neon_role.this.name}:${neon_role.this.password}@${neon_endpoint.this.host}/${neon_database.this.name}?sslmode=require"
  sensitive   = true
}

output "project_id" {
  description = "ID du projet Neon"
  value       = neon_project.this.id
}

output "database_host" {
  description = "Host de la base Neon"
  value       = neon_endpoint.this.host
}
