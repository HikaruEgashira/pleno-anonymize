# [Presidio + spaCy-LLM] 日本語対応 PII filter

Presidio と spaCy-LLMを使用した、PII検出・匿名化サーバーです。

## クイックスタート

### 環境セットアップ

```bash
# 依存関係のインストール
uv sync

# OpenAI API キーを設定
export OPENAI_API_KEY=your_api_key_here
```

### サーバー起動

```bash
uv run uvicorn app:app --reload --port 8000
```

サーバーが `http://localhost:8000` で起動します。

## API エンドポイント

### 1. `/analyze` - PII検出

テキスト中のPIIエンティティを検出します。

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en"
  }'
```

### 2. `/redact` - PII匿名化

テキスト中のPIIを検出して匿名化します。

```bash
curl -X POST http://localhost:8000/redact \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en"
  }'
```
