#!/bin/bash
set -e

BUCKET_NAME="pleno-anonymize-tfstate"
REGION="ap-northeast-1"

echo "Creating S3 bucket for Terraform state..."

# Create bucket
aws s3api create-bucket \
  --bucket "$BUCKET_NAME" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION" \
  2>/dev/null || echo "Bucket may already exist, continuing..."

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket "$BUCKET_NAME" \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration '{
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  }'

echo "S3 backend bucket '$BUCKET_NAME' is ready."
echo ""
echo "Next steps:"
echo "  1. cd app/infra"
echo "  2. terraform init"
echo "  3. terraform plan"
echo "  4. terraform apply"
