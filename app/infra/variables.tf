variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 120
}

variable "openai_api_base" {
  description = "OpenAI API base URL"
  type        = string
  default     = "https://api.openai.com"
}

variable "custom_domain" {
  description = "Custom domain for API"
  type        = string
  default     = "anonymize.plenoai.com"
}

variable "lambda_image_uri" {
  description = "ECR image URI for Lambda function"
  type        = string
  default     = ""
}

variable "openai_api_key" {
  description = "OpenAI API Key for spacy-llm"
  type        = string
  sensitive   = true
  default     = ""
}

variable "invitely_introspect_url" {
  description = "Invitely token introspection endpoint URL"
  type        = string
  default     = ""
}
