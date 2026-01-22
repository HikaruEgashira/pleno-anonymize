# 引き継ぎ資料: invitely認証統合

## 現在の状況

### 完了済み
- pleno-anonymize APIはLambdaにデプロイ済み
- 認証機能（invitely OAuth token introspection）のコードは実装済み
- `INVITELY_INTROSPECT_URL=https://invitely.plenoai.com/oauth/introspect` がLambda環境変数に設定済み
- APIは認証なしリクエストに対して `{"detail":"Authorization required"}` を返す状態

### 未完了（ブロッカー）
**invitelyサービスがデプロイされていない**

`invitely.plenoai.com` は存在せず、invitelyサービス自体が未デプロイ。

## 必要な作業

### 1. Authleteサービスアクセストークンの取得

**Authleteコンソール情報:**
- URL: https://console.authlete.com/org/594139377974264/server/53285/service/3824911432
- サービスID: `3824911432`
- クラスターURL: `https://jp.authlete.com`

**問題点:**
- コンソールのUI「新規作成」ボタンが反応しない（原因不明）
- 既存トークン（invitely-api-token等）の値はマスクされてコピー不可
- 組織トークン `9wyuFirAqtbJZi1J6SxadBVHcExcBnbVp7dTM9n5E4U` は作成済みだが、サービスAPIにはアクセス不可（404）

**解決方法の候補:**
1. Authleteサポートに問い合わせ
2. ブラウザのDevToolsでAPI呼び出しを確認し、直接APIを叩く
3. 自前JWT実装に切り替え（Authlete依存を外す）

### 2. SESメール送信設定

invitelyはマジックリンク認証を使用するため、SESでメール送信が必要。

```bash
# plenoai.comドメインの検証が必要
aws ses verify-domain-identity --domain plenoai.com
```

### 3. invitelyのSAMデプロイ

```bash
cd /Users/hikae/ghq/github.com/HikaruEgashira/invitely

# ビルド
pnpm install && pnpm build

# デプロイ（パラメータ要設定）
sam deploy \
  --parameter-overrides \
    FromEmail=noreply@plenoai.com \
    BaseUrl=https://invitely.plenoai.com \
    AuthleteServiceId=3824911432 \
    AuthleteAccessToken=<取得したトークン> \
    AllowedOrigins=https://plenoai.com
```

### 4. カスタムドメイン設定

**ACM証明書作成（us-east-1）:**
```bash
aws acm request-certificate \
  --domain-name invitely.plenoai.com \
  --validation-method DNS \
  --region us-east-1
```

**DNS設定（plenoai.comリポジトリ）:**
```hcl
# /Users/hikae/ghq/github.com/HikaruEgashira/plenoai.com/dns.tf に追加
resource "cloudflare_record" "invitely" {
  zone_id = data.cloudflare_zone.main.id
  name    = "invitely"
  content = "<API Gateway Domain>"
  type    = "CNAME"
  proxied = false
}
```

### 5. pleno-anonymizeのINVITELY_INTROSPECT_URL更新

デプロイ後のAPI Gateway URLに合わせて更新:
```bash
aws lambda update-function-configuration \
  --function-name pleno-anonymize-api \
  --environment "Variables={INVITELY_INTROSPECT_URL=https://invitely.plenoai.com/oauth/introspect,...}"
```

## 代替案: 自前JWT実装

Authlete設定が困難な場合、invitelyの`AuthProvider`インターフェースを利用して自前JWT実装に切り替え可能。

**変更対象:**
- `/Users/hikae/ghq/github.com/HikaruEgashira/invitely/packages/adapters/src/` に `JwtAuthProvider` を追加
- `/Users/hikae/ghq/github.com/HikaruEgashira/invitely/apps/api/src/container.ts` でDI切り替え

## 関連リポジトリ

| リポジトリ | 用途 |
|-----------|------|
| pleno-anonymize | PII匿名化API（本リポジトリ） |
| invitely | 認証サービス |
| plenoai.com | DNS/Cloudflare設定 |

## 連絡先

Authleteアカウント: hikae egashira
