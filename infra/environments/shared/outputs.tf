output "database_url_main" {
  description = "URI de connexion PostgreSQL — production (branche main)"
  value       = module.database.connection_uri_main
  sensitive   = true
}

output "database_url_preview" {
  description = "URI de connexion PostgreSQL — preview"
  value       = module.database.connection_uris["preview"]
  sensitive   = true
}

output "database_host_main" {
  description = "Host PostgreSQL — production"
  value       = module.database.host_main
}

output "database_host_preview" {
  description = "Host PostgreSQL — preview"
  value       = module.database.hosts["preview"]
}

output "neon_project_id" {
  description = "ID du projet Neon"
  value       = module.database.project_id
}

output "vercel_project_id" {
  description = "ID du projet Vercel"
  value       = module.frontend.project_id
}

output "vercel_project_name" {
  description = "Nom du projet Vercel"
  value       = module.frontend.project_name
}
