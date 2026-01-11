# pleno-anonymize

日本語対応 PII（個人情報）匿名化サーバー。Presidio + spaCy-LLM を使用。

- **Website:** https://plenoai.com/pleno-anonymize/
- **API Docs:** https://plenoai.com/pleno-anonymize/docs
- **Production API:** https://anonymize.plenoai.com

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

テキストや画像中の個人情報をマスキングします。画像にも対応しています。

#### テキストのみ
```bash
curl -X POST https://anonymize.plenoai.com/api/redact \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en"
  }'
```

### 3. `/api/openai/*` - OpenAI API プロキシ

OpenAI API へのプロキシエンドポイント。**リクエスト内のPII（テキスト・画像両方）を自動的にマスキングしてからOpenAI APIに送信し、レスポンス時に元の値を復元**します。

```bash
# Chat Completions API（自動redact有効）
curl -X POST https://anonymize.plenoai.com/api/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.2",
    "messages": [{"role": "user", "content": "John Smithさん（john@example.com）について教えて"}]
  }'
# → OpenAI APIには "<PERSON_0>さん（<EMAIL_ADDRESS_7>）について教えて" が送信される
# → レスポンスでプレースホルダーが元の値に復元される
```
