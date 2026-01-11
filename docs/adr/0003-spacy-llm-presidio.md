# ADR 0003: spaCy-LLM + Presidio for PII Detection

## Status

Accepted

## Context

PII（個人情報）検出・匿名化エンジンを選定する必要がある。

候補:
1. **Microsoft Presidio** - オープンソースのPII検出/匿名化フレームワーク
2. **AWS Comprehend** - AWSのマネージドNLPサービス
3. **OpenAI API直接呼び出し** - GPTでPII検出

## Decision

**Presidio + spaCy-LLM** の組み合わせを採用する。

### 理由
1. **精度**: spaCy-LLMでGPTを使用し、高精度なNER（固有表現抽出）が可能
2. **柔軟性**: Presidioの豊富なRecognizerとAnonymizerを利用可能
3. **コスト**: AWS Comprehendより安価（OpenAI API料金のみ）
4. **カスタマイズ性**: 日本語対応など拡張が容易

### 構成
```
spaCy Pipeline (spaCy-LLM)
    └── NER Task (OpenAI GPT)
           └── Presidio AnalyzerEngine
                  └── Presidio AnonymizerEngine
```

## Consequences

### Positive
- LLMベースの高精度NER
- Presidioの豊富な機能を利用可能
- カスタムRecognizerの追加が容易

### Negative
- OpenAI APIへの依存
- コールドスタート時の初期化が遅い
- spaCy-LLMのローカルフォークが必要（gpt-5-nano対応）
