# ------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------

output "s3_bucket_name" {
  description = "Upload static site assets here."
  value       = aws_s3_bucket.site.id
}

output "aws_profile" {
  description = "AWS CLI profile used by the hosting account (consumed by deploy.sh)."
  value       = var.aws_profile
}

output "cloudfront_distribution_id" {
  description = "Invalidate this distribution after every deploy."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront default hostname."
  value       = aws_cloudfront_distribution.site.domain_name
}

# ------------------------------------------------------------------
# THE IMPORTANT ONE — paste these NS values at your domain registrar
# (in the domain account: Route 53 → Registered domains → omerdengiz.com
# → Edit name servers). This is the one-time manual step.
# ------------------------------------------------------------------
output "route53_name_servers" {
  description = "Paste these 4 name servers at the domain registrar to delegate DNS to this hosted zone."
  value       = aws_route53_zone.site.name_servers
}

output "route53_zone_id" {
  description = "Route 53 hosted zone id for the domain."
  value       = aws_route53_zone.site.zone_id
}
