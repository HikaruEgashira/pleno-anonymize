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

### 2. `/api/redact` - PII匿名化（テキスト・画像対応）

テキストや画像中の個人情報をマスキングします。テキストと画像を同時に処理することも可能です。

#### テキストのみ
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

#### 画像のみ
```bash
curl -X POST https://anonymize.plenoai.com/api/redact \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgo...",
    "fill_color": [0, 0, 0]
  }'
```

**Response:**
```json
{
  "image": "data:image/png;base64,..."
}
```

#### テキスト + 画像
```bash
curl -X POST https://anonymize.plenoai.com/api/redact \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Contact: john@example.com",
    "image": "data:image/png;base64,..."
  }'
```

**Response:**
```json
{
  "text": "Contact: <EMAIL_ADDRESS>",
  "items": ["replace"],
  "image": "data:image/png;base64,..."
}
```

**画像匿名化について:**
- OCR (Tesseract) で画像内のテキストを抽出
- Presidio でPIIを検出
- 検出箇所を指定色でマスキング（デフォルト: 黒）

### 3. `/api/openai/*` - OpenAI API プロキシ（自動PII匿名化付き）

OpenAI API へのプロキシエンドポイント。**リクエスト内のPII（テキスト・画像両方）を自動的にマスキングしてからOpenAI APIに送信し、レスポンス時に元の値を復元**します。

```bash
# Chat Completions API（自動redact有効）
curl -X POST https://anonymize.plenoai.com/api/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "John Smithさん（john@example.com）について教えて"}]
  }'
# → OpenAI APIには "<PERSON_0>さん（<EMAIL_ADDRESS_7>）について教えて" が送信される
# → レスポンスでプレースホルダーが元の値に復元される
```

**Vision API（画像内PII自動匿名化）:**
```bash
curl -X POST https://anonymize.plenoai.com/api/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "この画像に何が写っていますか？"},
        {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
      ]
    }]
  }'
# → 画像内のPII（名前、メール、電話番号等）がマスキングされてからOpenAI APIに送信される
```

**フロー:**
```
クライアント → [テキスト・画像のPII検出&マスキング] → OpenAI API
           ← [テキストのプレースホルダー復元] ←
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
