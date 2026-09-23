# ------------------------------------------------------------------
# Route 53: public hosted zone for the domain
#
# The registrar and this hosted zone now live in the SAME account, so the
# delegation is updated with one CLI call instead of a console visit:
#
#   terraform output -json route53_name_servers
#   aws route53domains update-domain-nameservers \
#     --region us-east-1 --domain-name omerdengiz.com \
#     --nameservers Name=<ns1> Name=<ns2> Name=<ns3> Name=<ns4>
#
# WHY THIS MATTERS (2026-09-23): the zone previously lived in a separate
# hosting account while the domain stayed with the registrar account. When
# the hosting account became inaccessible, the zone went with it, while the
# .com delegation still pointed at its nameservers, which then answered
# REFUSED. Every resolver returned SERVFAIL and the site was unreachable
# even though the domain registration was perfectly healthy. Keeping the
# zone and the registration together removes that failure mode: they can no
# longer be separated by an account-level problem.
#
# Deleting and recreating a hosted zone always yields a NEW nameserver set,
# so the delegation must be updated after any such rebuild.
# ------------------------------------------------------------------

resource "aws_route53_zone" "site" {
  name    = var.domain_name
  comment = "Managed by Terraform: omerdengiz.com static site"
}

# ------------------------------------------------------------------
# ACM validation records: created automatically, no manual step.
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
# Alias records: apex + www → CloudFront
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
