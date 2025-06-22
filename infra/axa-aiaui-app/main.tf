provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_service_account" "github_deployer" {
  account_id   = "github-deployer"
  display_name = "GitHub deployer for AXA-AIAUI"
}

resource "google_project_iam_member" "grant_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.github_deployer.email}"
}

resource "google_project_iam_member" "grant_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.github_deployer.email}"
}

resource "google_project_iam_member" "grant_viewer" {
  project = var.project_id
  role    = "roles/viewer"
  member  = "serviceAccount:${google_service_account.github_deployer.email}"
}

resource "google_project_iam_member" "artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.github_deployer.email}"
}

resource "google_service_account_key" "github_deployer_key" {
  service_account_id = google_service_account.github_deployer.name
  private_key_type   = "TYPE_GOOGLE_CREDENTIALS_FILE"
}

resource "google_artifact_registry_repository" "axa-aiaui_docker_repo" {
  provider              = google
  location              = var.region
  repository_id         = "axa-aiaui-docker"
  description           = "Docker repo for axa-aiaui-app"
  format                = "DOCKER"
  docker_config {
    immutable_tags = false
  }
}

resource "google_service_account_iam_member" "allow_act_as_compute" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/${var.project_number}-compute@developer.gserviceaccount.com"
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.github_deployer.email}"
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

resource "google_firebase_project" "axa_aiaui" {
  provider   = google-beta
  project    = var.project_id
}

resource "google_firebase_web_app" "axa_aiaui_web" {
  provider     = google-beta
  display_name = "AXA AIA UI Web"
  project      = var.project_id
}

data "google_firebase_web_app_config" "axa_aiaui_config" {
  provider = google-beta
  project  = var.project_id
  web_app_id   = google_firebase_web_app.axa_aiaui_web.app_id
}

resource "google_firestore_database" "firestore_main" {
  provider    = google-beta
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}

resource "google_storage_bucket" "gcs_bucket" {
  name          = "${var.project_id}-storage"
  location      = var.region
  force_destroy = false
  
  uniform_bucket_level_access = true
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
  
  cors {
    origin          = ["*"]
    method          = ["GET", "POST", "PUT", "DELETE", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

output "GOOGLE_APPLICATION_CREDENTIALS" {
  value       = google_service_account_key.github_deployer_key.private_key
  sensitive   = true
}

output "DEPLOY_SA_EMAIL" {
  value = google_service_account.github_deployer.email
}

output "firebase_web_config" {
  value = data.google_firebase_web_app_config.axa_aiaui_config
}

output "firebase_storage_bucket" {
  value = google_storage_bucket.gcs_bucket.name
}

output "gcs_bucket" {
  value = google_storage_bucket.gcs_bucket.name
}