# Vercel デプロイ手順

このアプリ（Next.js 14 + Supabase）を Vercel にデプロイするための具体手順です。

## 必要情報
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクト URL（例: https://xxxx.supabase.co）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon 公開キー
- `APP_SHARED_PASSWORD`: 共有ログイン用パスワード（本番では強固な値）
- `APP_BASE_URL`（任意）: 例 `https://<your-project>.vercel.app`

## 1) GitHub 経由（推奨）
1. リポジトリを GitHub にプッシュ（未設定なら）
   ```powershell
   git init
   git add .
   git commit -m "chore: initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-name>/<your-repo>.git
   git push -u origin main
   ```
2. Vercel ダッシュボード → Add New… → Project → Import Git Repository
3. フレームワークは自動で Next.js になります（Build: `next build` のままでOK）。
4. Project Settings → Environment Variables に以下を追加（Production/Preview 両方に）
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `APP_SHARED_PASSWORD`
   - `APP_BASE_URL`（任意）
5. Deploy を実行。完了後の URL を共有。

## 2) Vercel CLI 経由
```powershell
npm i -g vercel
vercel login

# 初回: 対話に沿ってプロジェクト作成（Framework: Next.js）
vercel

# 環境変数を追加（Production/Preview 双方に）
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add APP_SHARED_PASSWORD production
vercel env add APP_BASE_URL production  # 任意
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add APP_SHARED_PASSWORD preview
vercel env add APP_BASE_URL preview     # 任意

# 本番デプロイ
vercel --prod
```

## トラブルシュート
- ログインがループ/保存されない
  - ブラウザのサードパーティ Cookie 設定を確認。
  - `APP_BASE_URL` を Vercel の URL に設定して再デプロイ。
  - 本番は HTTPS なので Cookie の Secure/SameSite の影響を確認。
- Supabase Realtime が反映されない
  - Supabase ダッシュボードの Replication 設定で `public.user_progress`（必要なら `public.team_goals`）を有効化。
  - それでも即時反映されない場合、画面操作後は `router.refresh()` により最新化されます。
- RLS（行レベルセキュリティ）
  - まだ無効であればそのままでも動作します。公開運用時は anon ロール向けの `select/insert/update/delete` ポリシーを検討してください。

## 備考
- `package.json` の `build`/`start` は Vercel 既定設定でそのまま動作します。
- 追加の `vercel.json` は不要です（特殊なヘッダー/リダイレクトが必要な場合のみ検討）。
