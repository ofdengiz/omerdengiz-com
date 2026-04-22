# Primary provider: hosts S3, CloudFront, IAM. Region chosen by variable.
provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = local.common_tags
  }
}

# ACM certificates for CloudFront AND Lambda@Edge functions MUST live in
# us-east-1 regardless of where the rest of the stack is deployed.
provider "aws" {
  alias   = "us_east_1"
  region  = "us-east-1"
  profile = var.aws_profile

  default_tags {
    tags = local.common_tags
  }
}
