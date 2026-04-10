terraform {
  required_version = ">= 1.5"

  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.6"
    }
  }
}

provider "neon" {
  api_key = var.neon_api_key
}

module "database" {
  source = "../../modules/neon"

  project_name  = "yammaster"
  region        = "aws-eu-central-1"
  branches      = ["preview"]
  database_name = "yammaster"
  role_name     = "yammaster"
}
