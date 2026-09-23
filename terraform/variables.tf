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

variable "active_aliases" {
  description = <<-EOT
    Explicit list of alternate domain names to attach to the distribution.

    Leave null in steady state — the distribution then serves domain_name plus
    extra_aliases, which is what you want.

    Set it explicitly only while an alias is stranded. CloudFront enforces
    global CNAME uniqueness across all AWS accounts, so an alias still held by
    a distribution in an unreachable account cannot be attached here and every
    apply fails with CNAMEAlreadyExists. Listing only the aliases actually
    attached keeps Terraform honest about reality instead of fighting it, and
    stops a later apply from silently stripping the aliases that did move.

    Recover a stranded alias by publishing a TXT record named `_<alias>` whose
    value is the target distribution's domain name, then calling
    `aws cloudfront associate-alias`. Note this is impossible for a zone apex:
    `_example.com` is a sibling of `example.com`, not a child, so it cannot be
    created in that zone. Apex recovery needs AWS Support or access to the
    account holding it.
  EOT
  type        = list(string)
  default     = null
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

  all_aliases = var.active_aliases != null ? var.active_aliases : concat([var.domain_name], var.extra_aliases)
}
