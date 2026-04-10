output "project_id" {
  description = "ID du projet Vercel"
  value       = vercel_project.frontend.id
}

output "project_name" {
  description = "Nom du projet Vercel"
  value       = vercel_project.frontend.name
}
