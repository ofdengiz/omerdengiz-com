# ------------------------------------------------------------------
# ACM — public TLS certificate for CloudFront, issued in us-east-1
#
# The DNS hosted zone lives in a DIFFERENT AWS account, so this module
# does NOT create validation records automatically. It creates the cert
# with DNS validation and exposes the validation CNAMEs as outputs.
#
# You add those CNAMEs in the domain account's Route 53 hosted zone,
# then re-run `terraform apply` — the cert moves to ISSUED.
# ------------------------------------------------------------------

resource "aws_acm_certificate" "site" {
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  subject_alternative_names = var.extra_aliases
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Wait for validation to complete before attaching to CloudFront.
# Route53 records are created in route53.tf; validation happens automatically
# once DNS has propagated to the new name servers.
resource "aws_acm_certificate_validation" "site" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for r in aws_route53_record.acm_validation : r.fqdn]

  timeouts {
    create = "60m"
  }
}
