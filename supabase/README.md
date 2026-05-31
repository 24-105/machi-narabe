# Ranking Setup

`まちならべ` の総合ランキングは Supabase Edge Function 経由で保存します。
GitHub Pages 側には秘密鍵を置きません。

## いま用意してあるもの

- 総合ランキング用のDB定義
- スコア登録とトップ10取得を行う Edge Function
- GitHub Pagesから呼び出すための `src/config.js` の接続口

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

## あなたにやってほしいこと

### 1. Supabaseプロジェクトを作る

Supabaseで新しいプロジェクトを作ります。
作成後、Project Settingsで次の2つを確認します。

- Project ref
- service_role key

`service_role key` は秘密鍵です。GitHub Pages、`src/config.js`、GitHubの通常ファイルには入れないでください。
Supabaseの予約名を避けるため、Function用の環境変数名は `SUPABASE_` で始めません。

### 2. DBテーブルを作る

SupabaseのSQL Editorで、このリポジトリの `supabase/schema.sql` を実行してください。

### 3. Edge Functionの秘密情報を設定する

Supabase Dashboardの Edge Functions Secrets で設定します。
本番だけなら `APP_ORIGINS` は `https://24-105.github.io` でOKです。
ローカルやiPhone確認も一緒に使う場合は、必要なURLをカンマ区切りで追加します。

```txt
MACHI_DB_URL=https://<project-ref>.supabase.co
MACHI_SERVICE_ROLE_KEY=<service-role-key>
APP_ORIGINS=https://24-105.github.io,http://127.0.0.1:4387,http://192.168.0.197:4387
```

### 4. Edge FunctionをDashboardで作る

- Edge Functions で新しいFunctionを作る
- Function名は `machi-ranking`
- Dashboard Editorで `functions/machi-ranking/index.ts` の中身を入れる
- GitHub Pagesから呼ぶため、JWT verificationはオフにする
- Deployする

### 5. フロント側にURLを入れる

デプロイ後の Function URL を `src/config.js` の `rankingApiUrl` に入れます。

```js
window.MACHI_NARABE_CONFIG = {
  rankingApiUrl: "https://<project-ref>.supabase.co/functions/v1/machi-ranking",
};
```

ここに入れるのはFunction URLだけです。
`MACHI_SERVICE_ROLE_KEY` は絶対に入れないでください。

## 動作確認

Function URLを入れたあと、ブラウザでゲームを遊んでリザルト画面まで進めるとスコアが送信されます。
手元でAPIだけ確認する場合は、次のように叩けます。

```sh
curl https://<project-ref>.supabase.co/functions/v1/machi-ranking
```

```sh
curl -X POST https://<project-ref>.supabase.co/functions/v1/machi-ranking \
  -H 'Content-Type: application/json' \
  -d '{
    "randomName": "まち太郎",
    "score": 12345,
    "maxLevel": 3,
    "maxChain": 4,
    "turns": 42
  }'
```

返ってくるランキングは総合トップ10です。
