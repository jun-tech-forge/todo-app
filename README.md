# Todo App

Next.js、FastAPI、PostgreSQL で構成した ToDo CRUD アプリです。フロントエンドは React サンプルの画面構成を参考にし、バックエンドは FastAPI サンプルのレイヤー分割をベースにしています。

## 構成

- frontend: Next.js App Router、axios、Tailwind CSS
- backend: FastAPI、SQLAlchemy、PostgreSQL、Pydantic、passlib
- db: PostgreSQL 16

## ECS 2サービス構成

- frontend と backend は別 Dockerfile、別 buildspec で独立ビルドできます。
- AWS サンプルと同様に、frontend 用 ECS サービスと backend 用 ECS サービスへ分離してデプロイできます。
- イメージ単体の既定待受ポートは frontend / backend ともに 80 です。
- ローカルの Docker Compose では .env の PORT 設定を使い、既定では `localhost:3000 -> frontend:8080`、`localhost:8000 -> backend:8081` を中継します。

## 主な機能

- ユーザーIDとパスワードによるログイン
- セッション Cookie による認証状態の維持
- ToDo の作成、取得、更新、削除
- ゴミ箱画面と一括削除
- Docker Compose によるローカル起動
- AWS CodeBuild から ECR へ個別イメージをプッシュ可能な buildspec

## ローカル起動

1. .env.example を .env にコピーします。
2. .env 内の資格情報プレースホルダーを実際の値へ置き換えます。
3. ルートで次を実行します。

```bash
bash scripts/reset-local.sh
```

scripts/reset-local.sh は次をまとめて実行します。

- Docker Compose の停止とボリューム削除
- frontend / backend / db の再ビルドと再起動
- sql/user_registration.sql の権限付与部分の適用
- sql/create_table.sql の適用
- sql/sample_insert.sql の適用

4. 起動後に次へアクセスします。

- Frontend: http://localhost:3000/login
- Backend healthcheck: http://localhost:8000/health
- Backend API docs: http://localhost:8000/docs

## ローカル検証手順

1. bash scripts/reset-local.sh を実行して、DB を含めて初期化済みの状態を作ります。
2. Frontend のログイン画面 http://localhost:3000/login を開きます。
3. .env に設定した DEMO_USER_ID と DEMO_USER_PASSWORD でログインします。
4. ToDo の新規作成、完了切替、削除、ゴミ箱表示を確認します。
5. 必要に応じて frontend の healthcheck を http://localhost:3000/healthcheck で確認します。
6. 必要に応じて backend の疎通を http://localhost:8000/health と http://localhost:8000/docs で確認します。

## デモユーザー

- ユーザーID: .env の DEMO_USER_ID
- パスワード: .env の DEMO_USER_PASSWORD

アプリ起動時に対象ユーザーが存在しない場合は自動作成されます。

## 環境変数

ローカルでは .env または Docker Compose の environment を使用します。AWS では Secrets Manager、Systems Manager Parameter Store、ECS タスク定義などからコンテナ環境変数へ注入する前提です。アプリケーションは取得元を意識せず、最終的に環境変数だけを参照します。

主要な変数:

- FRONTEND_PORT: frontend コンテナ待受ポート
- BACKEND_SCHEMA: frontend が backend URL を組み立てる際のスキーマ
- BACKEND_FQDN: frontend が runtime で参照する backend のホスト名

- DB_HOST: アプリケーションが接続する PostgreSQL のホスト名
- DB_PORT: アプリケーションが接続する PostgreSQL のポート
- DB_USERNAME: アプリケーションが接続する PostgreSQL のユーザー名
- DB_PASSWORD: アプリケーションが接続する PostgreSQL のパスワード
- DB_NAME: アプリケーションが接続する PostgreSQL のデータベース名

- POSTGRES_DB: PostgreSQL コンテナ初期化時に作成するデータベース名
- POSTGRES_USER: PostgreSQL コンテナ初期化時に作成するユーザー名
- POSTGRES_PASSWORD: PostgreSQL コンテナ初期化時に設定するパスワード

- CORS_ORIGINS: backend が許可するオリジンの一覧。カンマ区切りで指定します。
- SESSION_SECRET: セッション Cookie の署名に使う秘密鍵
- SESSION_COOKIE_NAME: セッション Cookie の名前
- DISABLE_SECURE_COOKIES: true の場合は Secure 属性なしで Cookie を発行します
- LOG_SQL: true の場合は SQL ログを出力します

- DEMO_USER_ID: 起動時に自動作成するデモユーザーのログイン ID
- DEMO_USER_NAME: 起動時に自動作成するデモユーザーの表示名
- DEMO_USER_PASSWORD: 起動時に自動作成するデモユーザーのパスワード

ECS 2サービス構成での frontend から backend への接続:

- frontend は browser から backend を直接呼ばず、Next.js の proxy ルート経由で backend API を呼びます。
- ECS 本番では frontend タスク定義に BACKEND_FQDN と BACKEND_PORT を必ず設定してください。
- 必要に応じて BACKEND_SCHEMA も設定してください。既定値は http:// です。
- 例: BACKEND_SCHEMA=http://, BACKEND_FQDN=backend-app.portfolio.local, BACKEND_PORT=8081
- ECS 本番で BACKEND_FQDN / BACKEND_PORT が未設定の場合、frontend は起動しても API proxy が失敗します。
- localhost や 127.0.0.1 は frontend コンテナ自身を指すため、2サービス構成の backend 接続先には使えません。

AWS コンテナ本サンプルとの互換:

- frontend は BACKEND_SCHEMA / BACKEND_FQDN / BACKEND_PORT から backend 接続先を runtime で組み立てます。
- frontend の API proxy は production で BACKEND_FQDN / BACKEND_PORT 未設定を許可しません。
- backend は DB_HOST / DB_USERNAME / DB_PASSWORD / DB_NAME をそのまま受け取れます。
- DISABLE_SECURE_COOKIES もサンプルと同名で受け取れます。
- Docker Compose 利用時は frontend / backend のコンテナ内ポートを .env の FRONTEND_PORT / BACKEND_PORT で明示的に指定します。
- frontend は `/healthcheck` を公開します。
- backend は `/health` と `/healthcheck` の両方を公開します。

## AWS CodeBuild

- フロントエンド: frontend/buildspec.yml
- バックエンド: backend/buildspec.yml

CodeBuild 環境変数として少なくとも次を設定してください。

- AWS_ACCOUNT_ID
- AWS_REGION
- APP_NAME
- IMAGE_TAG: 未指定時は CODEBUILD_RESOLVED_SOURCE_VERSION の先頭 7 文字を使用
- CONTAINER_NAME を変えたい場合は buildspec 内の既定値を更新

APP_NAME には frontend 用なら ECR リポジトリ名、backend 用なら別の ECR リポジトリ名を設定してください。
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

- 認証は将来 JWT へ差し替えやすいように backend/app/dependencies/auth.py へ集約しています。
- フロントエンドの axios 設定は frontend/lib/api-client.ts に集約しています。
