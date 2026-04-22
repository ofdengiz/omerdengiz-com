# ------------------------------------------------------------------
# Route 53 — public hosted zone for the domain (Strategy A: full delegation)
#
# After the first apply:
#   1. terraform output route53_name_servers   → gives you 4 NS values
#   2. In the DOMAIN account (the one that has the domain registered):
#        Route 53 → Registered domains → omerdengiz.com → Edit name servers
#        → paste the 4 NS values from above
#   3. DNS propagates in ~5–60 minutes and this hosted zone becomes the
#      authoritative source of truth. The old zone in the domain account
#      can be safely deleted once propagation is confirmed.
# ------------------------------------------------------------------

resource "aws_route53_zone" "site" {
  name    = var.domain_name
  comment = "Managed by Terraform — omerdengiz.com static site"
}

# ------------------------------------------------------------------
# ACM validation records — created automatically, no manual step.
# ------------------------------------------------------------------
resource "aws_route53_record" "acm_validation" {
  for_each = {
    for o in aws_acm_certificate.site.domain_validation_options : o.domain_name => {
      name  = o.resource_record_name
      type  = o.resource_record_type
      value = o.resource_record_value
    }
  }

  zone_id         = aws_route53_zone.site.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 60
  records         = [each.value.value]
  allow_overwrite = true
}

# ------------------------------------------------------------------
# Alias records — apex + www → CloudFront
# ------------------------------------------------------------------
resource "aws_route53_record" "apex_a" {
  zone_id = aws_route53_zone.site.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex_aaaa" {
  zone_id = aws_route53_zone.site.zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "alias_a" {
  for_each = toset(var.extra_aliases)

  zone_id = aws_route53_zone.site.zone_id
  name    = each.value
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "alias_aaaa" {
  for_each = toset(var.extra_aliases)

  zone_id = aws_route53_zone.site.zone_id
  name    = each.value
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
