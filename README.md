# pleno-anonymize

日本語対応 PII（個人情報）匿名化サーバー。Presidio + spaCy-LLM を使用。

## Project Structure

```
.
├── app/                  # アプリケーション
│   ├── app.py           # FastAPI サーバー
│   ├── config.cfg       # spaCy-LLM 設定
│   └── pyproject.toml   # 依存関係
├── packages/
│   └── spacy-llm/       # spaCy-LLM ローカルフォーク
└── website/             # ドキュメントサイト
```

## Setup

```bash
uv sync

export OPENAI_API_KEY=your_api_key_here
cd app && uv run uvicorn app:app --reload --port 8000
```

## API Endpoints

### 1. `/analyze` - PII検出

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en"
  }'
```

### 2. `/redact` - PII匿名化

```bash
curl -X POST http://localhost:8000/redact \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en"
  }'
```
