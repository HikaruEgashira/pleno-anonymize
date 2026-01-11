# pleno-anonymize

日本語対応 PII（個人情報）匿名化サーバー。Presidio + spaCy-LLM を使用。

**Production URL:** https://anonymize.plenoai.com

## API Endpoints

### 1. `/api/analyze` - PII検出

テキスト中の個人情報（PII）エンティティを検出します。

```bash
curl -X POST https://anonymize.plenoai.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en"
  }'
```

**Response:**
```json
[
  {"entity_type": "EMAIL_ADDRESS", "start": 38, "end": 54, "score": 1.0, "text": "john@example.com"},
  {"entity_type": "PERSON", "start": 11, "end": 19, "score": 0.85, "text": "John Doe"}
]
```

### 2. `/api/redact` - PII匿名化

テキスト中の個人情報をマスキングします。

```bash
curl -X POST https://anonymize.plenoai.com/api/redact \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en"
  }'
```

**Response:**
```json
{
  "text": "My name is <PERSON> and my email is <EMAIL_ADDRESS>",
  "items": ["replace", "replace"]
}
```

### 3. `/api/openai/*` - OpenAI API プロキシ

OpenAI API へのプロキシエンドポイント。

```bash
curl https://anonymize.plenoai.com/api/openai/v1/models \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY"
```

## Local Development

```bash
uv sync

export OPENAI_API_KEY=your_api_key_here
cd app && uv run uvicorn app:app --reload --port 8000
```

## Project Structure

```
.
├── app/
│   ├── app.py           # FastAPI サーバー
│   ├── handler.py       # AWS Lambda ハンドラー
│   ├── config.cfg       # spaCy-LLM 設定
│   ├── Dockerfile       # Lambda コンテナイメージ
│   └── infra/           # Terraform インフラ
├── packages/
│   └── spacy-llm/       # spaCy-LLM ローカルフォーク
└── website/             # ドキュメントサイト
```

## Infrastructure

- **AWS Lambda** (Container Image)
- **API Gateway HTTP API** with custom domain
- **ECR** for Docker image storage
- **ACM** for SSL certificate
- **Cloudflare** for DNS
