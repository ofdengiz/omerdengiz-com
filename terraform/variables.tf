variable "aws_region" {
  description = "Region for the hosting stack (S3 bucket, IAM). CloudFront + Lambda@Edge are always us-east-1."
  type        = string
  default     = "ca-central-1"
}

variable "aws_profile" {
  description = "AWS CLI profile that maps to the hosting account. Leave blank to use the default credentials chain."
  type        = string
  default     = null
}

variable "domain_name" {
  description = "Primary domain served by the CloudFront distribution."
  type        = string
  default     = "omerdengiz.com"
}

variable "extra_aliases" {
  description = "Additional CNAMEs that should resolve to the same distribution (e.g. www)."
  type        = list(string)
  default     = ["www.omerdengiz.com"]
}

variable "site_source_path" {
  description = "Filesystem path to the built static site that will be synced to S3."
  type        = string
  default     = "../site"
}

variable "project" {
  description = "Short identifier used in resource names and tags."
  type        = string
  default     = "omerdengiz-com"
}

locals {
  common_tags = {
    Project     = var.project
    Environment = "prod"
    ManagedBy   = "terraform"
    Owner       = "omer.dengiz"
  }

  all_aliases = concat([var.domain_name], var.extra_aliases)
}
