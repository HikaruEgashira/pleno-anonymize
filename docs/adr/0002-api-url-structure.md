# ADR 0002: API URL Structure

## Status

Accepted

## Context

APIのURLパス構造を決定する必要がある。

候補:
1. `api.anonymize.plenoai.com/analyze` - サブドメインでAPI、ルートパス
2. `anonymize.plenoai.com/api/analyze` - シンプルなサブドメイン、/api/プレフィックス

## Decision

`anonymize.plenoai.com/api/*` 形式を採用する。

### 理由
1. **拡張性**: 将来的にウェブUIを同じドメインで提供可能
2. **シンプルさ**: 1つのサブドメインで管理
3. **慣例**: 多くのAPIサービスが `/api/` プレフィックスを使用

### エンドポイント
- `POST /api/analyze` - PII検出
- `POST /api/redact` - PII匿名化
- `* /api/openai/*` - OpenAI APIプロキシ

## Consequences

### Positive
- 将来的な拡張が容易
- URL構造が明確

### Negative
- URLが少し長くなる
