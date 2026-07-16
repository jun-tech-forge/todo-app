# Todo App

Next.js、FastAPI、PostgreSQL で構成した ToDo CRUD アプリです。フロントエンドは React サンプルの画面構成を踏襲し、バックエンドは FastAPI サンプルのレイヤー分割を参考にしています。

## 構成

- frontend: Next.js App Router、axios、Tailwind CSS
- backend: FastAPI、SQLAlchemy、PostgreSQL、Pydantic、passlib
- db: PostgreSQL 16

## ECS 2サービス構成

- frontend と backend は別 Dockerfile、別 buildspec で独立ビルドできます。
- AWS サンプルと同様に、frontend 用 ECS サービスと backend 用 ECS サービスへ分離してデプロイできます。
- コンテナ内待受ポートは両方とも既定で `80` です。
- ローカルでは Docker Compose が `localhost:3000 -> frontend:80`、`localhost:8000 -> backend:80` を中継します。

## 主な機能

- ユーザーIDとパスワードによるログイン
- セッション Cookie による認証状態の維持
- ToDo の作成、取得、更新、削除
- ゴミ箱画面と一括削除
- Docker Compose によるローカル起動
- AWS CodeBuild から ECR へ個別イメージをプッシュ可能な buildspec

## ローカル起動

1. .env.example を .env にコピーして必要な値を設定します。
2. ルートで次を実行します。

```bash
docker compose up --build
```

3. 次へアクセスします。

- Frontend: http://localhost:3000
- Backend healthcheck: http://localhost:8000/health
- Backend API docs: http://localhost:8000/docs

## デモユーザー

- ユーザーID: .env の DEMO_USER_ID
- パスワード: .env の DEMO_USER_PASSWORD

アプリ起動時に対象ユーザーが存在しない場合は自動作成されます。

## 環境変数

ローカルでは .env または Docker Compose の environment を使用します。AWS では Secrets Manager、Systems Manager Parameter Store、ECS タスク定義などからコンテナ環境変数へ注入する前提です。アプリケーションは取得元を意識せず、最終的に環境変数だけを参照します。

主要な変数:

- DATABASE_URL: バックエンド用 PostgreSQL 接続 URL。未指定時は POSTGRES_* から組み立てます。
- DB_HOST: AWS コンテナ本サンプル互換の DB ホスト名
- DB_PORT: DB ポート。既定値は 5432
- DB_USERNAME: AWS コンテナ本サンプル互換の DB ユーザー名
- DB_PASSWORD: AWS コンテナ本サンプル互換の DB パスワード
- DB_NAME: AWS コンテナ本サンプル互換の DB 名
- BACKEND_PORT: backend コンテナ待受ポート。既定値は 80
- FRONTEND_PORT: frontend コンテナ待受ポート。既定値は 80
- POSTGRES_DB
- POSTGRES_USER
- POSTGRES_PASSWORD
- CORS_ORIGINS: カンマ区切り
- SESSION_SECRET
- SESSION_COOKIE_NAME
- DISABLE_SECURE_COOKIES
- APP_SERVICE_HOST: frontend が runtime で参照する backend API ホスト
- NEXT_PUBLIC_API_BASE_URL
- DEMO_USER_ID
- DEMO_USER_NAME
- DEMO_USER_PASSWORD

AWS コンテナ本サンプルとの互換:

- backend は DB_HOST / DB_USERNAME / DB_PASSWORD / DB_NAME をそのまま受け取れます。
- frontend は APP_SERVICE_HOST を runtime で参照します。
- DISABLE_SECURE_COOKIES もサンプルと同名で受け取れます。
- frontend / backend ともにコンテナ内ポートの既定値は 80 で、AWS サンプルと合わせています。
- backend は `/health` と `/healthcheck` の両方を公開します。
- frontend は `/healthcheck` を公開します。

## AWS CodeBuild

- フロントエンド: frontend/buildspec.yml
- バックエンド: backend/buildspec.yml

CodeBuild 環境変数として少なくとも次を設定してください。

- AWS_ACCOUNT_ID
- AWS_REGION
- FRONTEND_IMAGE_REPO または BACKEND_IMAGE_REPO
- IMAGE_TAG: 未指定時は CODEBUILD_RESOLVED_SOURCE_VERSION の先頭 7 文字を使用
- CONTAINER_NAME を変えたい場合は buildspec 内の既定値を更新

ECR リポジトリ名やリージョンは buildspec に固定していません。Secrets Manager や Parameter Store の値を CodeBuild 変数へ割り当てる構成でも利用できます。
CodeBuild の buildspec パスは frontend 用なら frontend/buildspec.yml、backend 用なら backend/buildspec.yml を指定してください。

## API 概要

- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/todos
- POST /api/todos
- PATCH /api/todos/{todo_id}
- DELETE /api/todos/{todo_id}
- DELETE /api/todos/trash/all

## 開発メモ

- 認証は将来 JWT へ差し替えやすいように dependencies/auth.py へ集約しています。
- フロントエンドの axios 設定は lib/api-client.ts に集約しています。