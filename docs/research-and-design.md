# チーム内目標管理アプリ リサーチ計画・設計書

最終更新: 2025-09-21

## 1. プロジェクト概要
- 目的: 4班（Web / アプリ / ゲーム / 映像）の目標と個人進捗を可視化・共有する。
- 非機能: 無料運用、簡易アクセス制限、モバイル対応、迅速な開発（Copilot活用）。
- 技術: Next.js(App Router), Supabase(PostgreSQL), Tailwind CSS + shadcn/ui, Vercel。

## 2. スコープと優先度
- Must: 班一覧/選択、班目標CRUD、個人進捗CRUD、簡易パスワード保護、リアルタイム反映、デプロイ。
- Should: ステータスフィルタ、軽い検索、基本的な入力検証、操作トースト。
- Could: 公開読み取りビュー、エクスポート(CSV)、軽量の画像添付（将来）。
- Won't: 複雑な認証/権限、SSO、外部連携。

## 3. データベース設計（Supabase）
```sql
-- teams
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- team_goals
create table if not exists public.team_goals (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

-- user_progress
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  author_name text not null,
  content text not null,
  status text not null check (status in ('未着手','進行中','完了')),
  created_at timestamptz not null default now()
);
```
- 代表的な索引: `create index on user_progress(team_id, created_at desc);`
- RLS: 内輪利用のため無効でも可。APIキーはサーバールート経由で扱う。必要に応じて将来RLS導入。

## 4. ルーティング & ミドルウェア
- `/` トップ（班選択）
- `/login` 簡易パスワード入力
- `/(protected)/[team_slug]` 班ダッシュボード
- `middleware.ts` で `/(protected)` へのアクセス時に Cookie `app-auth` を検査。無ければ `/login` へ。

## 5. API 設計（Next.js Route Handlers）
- `POST /api/login` 入力パスワード検証、Cookie `app-auth` 設定。
- 将来拡張: 必要なら `GET /api/teams`, `POST /api/team-goals` などを追加だが、基本はクライアントから Supabase 直接参照。

### リクエスト/レスポンス例
- POST `/api/login`
```json
{ "password": "..." }
```
200 OK
```json
{ "ok": true }
```
401 Unauthorized
```json
{ "ok": false, "error": "invalid_password" }
```

## 6. UI/UX 方針
- コンポーネント: shadcn/ui の Button, Card, Input, Textarea, Select, Dialog を中心に。
- アクセシビリティ: フォーカススタイル、ラベル、ロール属性。
- レイアウト: 1カラム（モバイル）、2カラム（md+）。

## 7. コンポーネント設計
- `components/auth/LoginForm.tsx` パスワード入力→API呼び出し→Cookieセット→元ページへ戻る。
- `components/home/TeamSelector.tsx` 班一覧カード表示。`/[slug]` へリンク。
- `components/teams/TeamGoalEditor.tsx` 班目標の表示/編集/保存。
- `components/teams/ProgressList.tsx` 進捗一覧＋リアルタイム購読。
- `components/teams/ProgressCard.tsx` 進捗カード（編集・削除・ステータス更新）。
- `components/teams/ProgressForm.tsx` 新規進捗投稿フォーム。

## 8. Copilot プロンプト集（コメント雛形）
- Supabase クライアント
```ts
// Create a Supabase client for client-side usage with env vars
```
- TeamSelector
```ts
// This component receives a list of teams and displays clickable cards.
// Each card links to /[slug]. Use Tailwind + shadcn/ui Card & Button.
```
- ProgressList
```ts
// Render a list of progress items with realtime updates using Supabase channel.
```
- TeamGoalEditor
```ts
// View and edit a single team goal. Toggle between read and edit modes.
```

## 9. リアルタイム更新
- `supabase.channel('progress').on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress', filter: 'team_id=eq.<id>' }, handler)`
- 受信時にローカルステートをマージ更新。

## 10. 運用設計
- 環境変数: `.env.local` に `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `APP_SHARED_PASSWORD`。
- デプロイ: Vercel に GitHub 連携、環境変数を設定。
- バックアップ: Supabase の自動バックアップに依存。重要データはエクスポート可。

## 11. マイルストーン
1. 骨子/ミドルウェア/ログイン導線（半日）
2. トップ→班選択（半日）
3. 班ダッシュボード（1日）
4. リアルタイム/微調整（半日）
5. デプロイ（1時間）

## 12. リスクと対応
- 無認証公開リスク: パスワードの共有と保管に注意。URL流出時の切替手順を README に記載。
- 無料枠制限: Supabase/Vercel のレートやコールドスタートに留意。キャッシュとクエリ最適化。
- 同時編集: 極力単純化し、直近編集優先ルールで対応。

## 13. テスト観点
- ミドルウェアのリダイレクト
- ログインAPIのCookie設定
- Supabase接続の疎通
- 目標/進捗のCRUD

---
この文書を起点に、各ファイル先頭へコメントを配置し、Copilot にコードの全体像を示してから補完を誘導してください。