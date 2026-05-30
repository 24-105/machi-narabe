# Ranking Setup

`まちならべ` の総合ランキングは Supabase Edge Function 経由で保存します。
GitHub Pages 側には秘密鍵を置きません。

## このリポジトリに入れるもの

- `schema.sql`: 総合ランキング用DBテーブル
- `config.toml`: `machi-ranking` Edge Functionを公開APIとして使う設定
- `functions/machi-ranking/index.ts`: ランキング取得とスコア保存API

## 保存しないもの

- ユーザーID
- IPアドレス
- User-Agent
- 端末ID
- ブラウザ指紋
- メールアドレスなどの個人情報

保存するのは、ランダムなプレイヤー名、スコア、最大建物、最大コンボ、手数、作成日時だけです。

## 手順

1. Supabaseで新しいプロジェクトを作る
2. Supabase SQL Editorで `schema.sql` を実行する
3. Supabase CLIでプロジェクトに接続する

```sh
supabase login
supabase link --project-ref <project-ref>
```

4. Edge Functionの秘密情報を設定する

```sh
supabase secrets set \
  SUPABASE_URL=https://<project-ref>.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
  APP_ORIGINS=https://24-105.github.io
```

5. Edge Functionをデプロイする

```sh
supabase functions deploy machi-ranking
```

6. `src/config.js` の `rankingApiUrl` に Function URL を入れる

```js
window.MACHI_NARABE_CONFIG = {
  rankingApiUrl: "https://<project-ref>.supabase.co/functions/v1/machi-ranking",
};
```

`SUPABASE_SERVICE_ROLE_KEY` は絶対に `src/config.js` や GitHub Pages へ入れないでください。
