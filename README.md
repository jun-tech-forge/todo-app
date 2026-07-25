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

## ローカル検証手順

1. コンテナ起動後に http://localhost:3000/login を開きます。
2. 次のデモユーザーでログインします。

- ユーザーID: demo
- パスワード: .env の DEMO_USER_PASSWORD

3. ログイン後、タスク一覧画面が表示されることを確認します。
4. 必要に応じて次も確認します。

- Frontend healthcheck: http://localhost:3000/healthcheck
- Backend healthcheck: http://localhost:8000/health
- Backend API docs: http://localhost:8000/docs

API の疎通だけ確認したい場合は、ルートで次を実行します。

```bash
curl http://localhost:8000/health
```

既存の PostgreSQL ボリュームに別設定のデータベースやロールが残っていると、ローカル起動時に接続エラーになることがあります。その場合は次の完全初期化を実行してください。

## 完全初期化

ローカル環境をまっさらにして、誰でも同じ状態から再起動できるようにするためのスクリプトを用意しています。ルートで次を実行してください。

```bash
./scripts/reset-local.sh
```

このスクリプトは次を行います。

- .env が無ければ .env.example から自動作成
- docker compose down --volumes --remove-orphans を実行
- PostgreSQL の永続ボリュームを削除して DB を完全初期化
- docker compose up --build -d を実行
- user_registration.sql の権限設定部分と、create_table.sql、sample_insert.sql を適用
- 起動後のコンテナ状態を表示

完全初期化は PostgreSQL の永続データを削除するため、ローカルで保存していた ToDo データは失われます。

## デモユーザー

- ユーザーID: .env の DEMO_USER_ID
- パスワード: .env の DEMO_USER_PASSWORD

アプリ起動時に対象ユーザーが存在しない場合は自動作成されます。

## 環境変数

ローカルでは .env の値を Docker Compose 経由で各コンテナへ渡します。AWS では Secrets Manager、Systems Manager Parameter Store、ECS タスク定義などからコンテナ環境変数へ注入する前提です。アプリケーションは取得元を意識せず、最終的に環境変数だけを参照します。

主要な変数:

- DB_HOST: backend が参照する DB ホスト名
- DB_PORT: backend が参照する DB ポート
- DB_USERNAME: backend が参照する DB ユーザー名
- DB_PASSWORD: backend が参照する DB パスワード
- DB_NAME: backend が参照する DB 名
- BACKEND_PORT: backend コンテナ待受ポート
- FRONTEND_PORT: frontend コンテナ待受ポート
- POSTGRES_DB: PostgreSQL 初期 DB 名
- POSTGRES_USER: PostgreSQL 初期ユーザー名
- POSTGRES_PASSWORD: PostgreSQL 初期パスワード
- CORS_ORIGINS: カンマ区切り
- SESSION_SECRET: セッション署名キー
- SESSION_COOKIE_NAME: セッション Cookie 名
- DISABLE_SECURE_COOKIES: secure Cookie を無効化する場合は true
- APP_SERVICE_HOST: frontend が runtime で参照する backend API ホスト
- NEXT_PUBLIC_API_BASE_URL: frontend の API ベース URL
- DEMO_USER_ID: デモユーザー ID
- DEMO_USER_NAME: デモユーザー表示名
- DEMO_USER_PASSWORD: デモユーザーパスワード

AWS コンテナ本サンプルとの互換:

- backend は DB_HOST / DB_USERNAME / DB_PASSWORD / DB_NAME をそのまま受け取れます。
- frontend は APP_SERVICE_HOST を runtime で参照します。
- DISABLE_SECURE_COOKIES もサンプルと同名で受け取れます。
- frontend / backend ともにローカル構成では .env の PORT 系変数を使用し、サンプル値は 80 です。
- backend は `/health` と `/healthcheck` の両方を公開します。
- frontend は `/healthcheck` を公開します。

## AWS CodeBuild

- フロントエンド: frontend/buildspec.yml
- バックエンド: backend/buildspec.yml

CodeBuild 環境変数として少なくとも次を設定してください。

- AWS_ACCOUNT_ID
- AWS_REGION
- APP_NAME
- IMAGE_TAG: 未指定時は CODEBUILD_RESOLVED_SOURCE_VERSION の先頭 7 文字を使用
- CONTAINER_NAME を変えたい場合は buildspec 内の既定値を更新

APP_NAME には frontend 用なら ECR リポジトリ名、backend 用なら別の ECR リポジトリ名を設定してください。Secrets Manager や Parameter Store の値を CodeBuild 変数へ割り当てる構成でも利用できます。
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
