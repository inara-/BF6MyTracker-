# BF6 My Tracker

Battlefield 6 (BF6) のプレイヤー戦績を追跡・表示するためのパーソナル・スタッツ・トラッカーです。
Gamtools Network APIを使用して最新の戦績を取得し、過去の戦績との差分（成長）を視覚化します。

## 主な機能
- **プレイヤーの基本戦績表示**: K/D比、KPM、DPM、勝率、スコア/分、ヘッドショット数、蘇生数、アシスト数などを表示。
- **成長の可視化**: 過去のデータと比較し、上昇・下降のトレンドをアイコン（矢印）で分かりやすく表示。
- **武器ランキング**: キル数が多い上位10件の武器を画像付きのテーブル形式で表示。命中率も確認可能。
- **ダークモードUI**: 最新のモダンでプレミアムなダークテーマを採用したデザイン。

## 技術スタック
- **フレームワーク**: Next.js 16 (App Router)
- **スタイリング**: Vanilla CSS (CSS Modules)
- **データベース ORM**: Prisma (v5)
- **データベース**: Turso (libSQL) / ローカル開発時はSQLite (`dev.db`)
- **デプロイ**: Vercel

## ローカルでの動かし方

1. リポジトリをクローンまたはダウンロードし、依存関係をインストールします。
   ```bash
   npm install
   ```

2. `.env` ファイルを作成し、環境変数を設定します。（`.env.example` を参考にしてください）
   ```env
   GAMETOOLS_PLAYER_NAME="your_player_name"
   GAMETOOLS_PLATFORM="pc"
   DATABASE_URL="file:./dev.db"
   ```
   ※クラウドのTursoデータベースを使用する場合は、`TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` を追加で設定してください。

3. ローカルデータベースのセットアップ（マイグレーション）を行います。
   ```bash
   npx prisma db push
   ```

4. 開発サーバーを起動します。
   ```bash
   npm run dev
   ```

5. ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスします。

## デプロイ方法 (Vercel + Turso)
本アプリケーションは Vercel へのデプロイに最適化されています。
1. **Turso** でデータベースを作成し、URLとAuth Tokenを取得します。
2. リポジトリを GitHub にプッシュします。
3. **Vercel** でリポジトリをインポートし、以下の環境変数を設定してデプロイします。
   - `GAMETOOLS_PLAYER_NAME`
   - `GAMETOOLS_PLATFORM`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. デプロイ完了後、`setup.sql` または Prisma CLI を使ってTursoデータベースにテーブルを作成してください。
