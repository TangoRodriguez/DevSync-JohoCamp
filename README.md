# DevSync

チーム内目標管理アプリ（Next.js + Supabase）

## セットアップ（Windows PowerShell）

```powershell
# 1) 依存関係のインストール
npm install

# 2) 環境変数を設定（.env.local を作成）
Copy-Item .env.local.example .env.local
# .env.local を開いて値を設定: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, APP_SHARED_PASSWORD

# 3) 開発サーバー起動
npm run dev
```

## Supabase テーブル作成
Supabase コンソールの SQL エディタで以下を実行:

```sql
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.team_goals (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  author_name text not null,
  content text not null,
  status text not null check (status in ('未着手','進行中','完了')),
  created_at timestamptz not null default now()
);
```

## 使い方
- `/login` で共有パスワードを入力し Cookie を取得。
- トップページで班を選択。
- 各班ダッシュボードで目標・進捗を閲覧/編集。

## デプロイ（Vercel）
最短手順は以下の通りです。

1) 本リポジトリを GitHub にプッシュ
2) Vercel ダッシュボードで Import → 環境変数を設定（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `APP_SHARED_PASSWORD`、任意で `APP_BASE_URL`）→ Deploy

詳細な手順（GitHub/CLI 両対応）やトラブルシュートは `docs/DEPLOYMENT.md` を参照してください。
