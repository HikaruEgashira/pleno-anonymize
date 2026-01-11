# ADR 0001: AWS Lambda Container Image

## Status

Accepted

## Context

pleno-anonymize APIをデプロイする方法を決定する必要がある。主な要件:
- spaCy + Presidio の依存関係が大きい (500MB以上)
- OpenAI APIへのHTTPリクエストが必要
- コールドスタートは許容できる

## Decision

AWS Lambda Container Image を使用する。

### 理由
1. **依存関係サイズ**: ZIP形式の250MB制限を超えるため、コンテナイメージが必要
2. **シンプルさ**: ECS/EKSより運用が簡単
3. **コスト**: 使用量ベースの課金で、低トラフィック時にコスト効率が良い
4. **スケーラビリティ**: 自動スケーリング

### 構成
- Base image: `public.ecr.aws/lambda/python:3.12`
- Memory: 512MB
- Timeout: 120秒

## Consequences

### Positive
- デプロイが簡単（terraform apply）
- 自動スケーリング
- 低コスト

### Negative
- コールドスタート（約30秒）
- メモリ制限（最大10GB）
