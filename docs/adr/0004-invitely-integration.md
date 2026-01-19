# ADR-0004: invitely統合による認証基盤導入

## ステータス

Accepted

## コンテキスト

pleno-anonymize APIは現在、認証なしで公開されている。以下の理由から認証基盤の導入が必要になった：

1. **アクセス制御**: APIの利用を招待されたユーザーに限定したい
2. **利用量追跡**: ユーザーごとの利用状況を把握したい
3. **将来的な課金**: 将来的にユーザー単位での課金を検討

## 検討した選択肢

### 選択肢1: 独自認証実装

自前でJWT発行・検証を実装する。

- **メリット**: 完全な制御、外部依存なし
- **デメリット**: セキュリティリスク、開発・運用コスト増

### 選択肢2: Auth0/Cognito等のSaaS

マネージド認証サービスを利用する。

- **メリット**: 実績あり、高機能
- **デメリット**: 従量課金コスト、ベンダーロックイン

### 選択肢3: invitely統合（採用）

社内認証基盤invitelyのToken Introspectionを利用する。

- **メリット**:
  - 既存インフラの活用
  - OAuth 2.0/OIDC標準準拠
  - 招待制認証との親和性
- **デメリット**:
  - invitelyへの依存
  - Introspectionのネットワークレイテンシ

## 決定

**選択肢3: invitely統合**を採用する。

理由：
1. pleno-anonymizeは社内サービス向けであり、invitelyの招待制モデルと整合する
2. Token Introspection（RFC 7662）は標準的なプロトコルで、将来的な認証基盤の変更も容易
3. 初期段階では高トラフィックは想定されず、Introspectionのレイテンシは許容範囲

## 実装

### 認証フロー

```
Client → pleno-anonymize → invitely /oauth/introspect
                              ↓
                         Token検証
                              ↓
                         active: true/false
```

### 認証対象エンドポイント

| エンドポイント | 認証 |
|---------------|------|
| `/api/analyze` | 必須 |
| `/api/redact` | 必須 |
| `/api/openai/*` | 任意（上流APIキーで保護） |
| `/api/anthropic/*` | 任意（上流APIキーで保護） |
| `/api/gemini/*` | 任意（上流APIキーで保護） |
| `/docs` | なし |

### 認証無効化

`INVITELY_INTROSPECT_URL`環境変数が未設定の場合、認証はスキップされる。これにより：
- ローカル開発が容易
- 段階的な導入が可能

## 影響

### セキュリティ

- APIアクセスがトークン保持者に限定される
- トークン漏洩時はinvitelyで失効可能

### パフォーマンス

- 各リクエストにIntrospection通信が追加（約10-50ms）
- 高トラフィック時はキャッシュまたはJWT検証への移行を検討

### 運用

- invitelyの稼働が前提条件
- invitely障害時は503エラー（fail-closed）

## 参考

- [RFC 7662 - OAuth 2.0 Token Introspection](https://datatracker.ietf.org/doc/html/rfc7662)
- [invitely Integration Guide](https://github.com/HikaruEgashira/invitely/docs/integration/)
