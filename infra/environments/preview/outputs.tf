output "backend_url" {
  description = "URL du backend preview"
  value       = module.backend.service_url
}

output "database_host" {
  description = "Host de la base de donnees preview"
  value       = module.database.database_host
}

output "database_connection_uri" {
  description = "URI de connexion PostgreSQL preview"
  value       = module.database.connection_uri
  sensitive   = true
}
