# ACM Certificate for custom domain (Regional for API Gateway HTTP API)
resource "aws_acm_certificate" "api" {
  domain_name       = var.custom_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway custom domain
resource "aws_apigatewayv2_domain_name" "api" {
  domain_name = var.custom_domain

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.api.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  depends_on = [aws_acm_certificate.api]
}

# API mapping
resource "aws_apigatewayv2_api_mapping" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.default.id
}

# Output for DNS configuration
output "api_gateway_domain_target" {
  description = "API Gateway domain target for CNAME record"
  value       = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
}

output "acm_validation_records" {
  description = "ACM certificate validation records (add to Cloudflare)"
  value = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}
