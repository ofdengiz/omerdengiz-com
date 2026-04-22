terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Uncomment and configure to use a remote backend (recommended for teams):
  #
  # backend "s3" {
  #   bucket         = "omerdengiz-tfstate"
  #   key            = "omerdengiz-com/terraform.tfstate"
  #   region         = "ca-central-1"
  #   dynamodb_table = "omerdengiz-tflock"
  #   encrypt        = true
  # }
}
