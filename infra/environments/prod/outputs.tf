output "backend_url" {
  description = "URL du backend production"
  value       = module.backend.service_url
}

output "database_host" {
  description = "Host de la base de donnees production"
  value       = module.database.database_host
}
