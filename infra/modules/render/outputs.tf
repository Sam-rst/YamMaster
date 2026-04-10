output "service_url" {
  description = "URL du service Render"
  value       = render_web_service.backend.url
}

output "service_id" {
  description = "ID du service Render"
  value       = render_web_service.backend.id
}
