# BF6 My Tracker 仕様書

## 1. システム概要
本システムは、Battlefield 6 のプレイヤーの戦績データを「GameTools API」経由で定期的に取得し、自分専用の戦績ダッシュボードとして表示するWebアプリケーションです。

## 2. システム要件 / アーキテクチャ
*   **フロントエンド**: Next.js (App Router), React
*   **バックエンド**: Next.js Server Components, Server Actions (必要に応じて)
*   **データベース**: 
    *   本番環境: Turso (libSQL / サーバーレス SQLite)
    *   開発環境: ローカル SQLite (`dev.db`)
*   **API連携**: GameTools Network API (`https://api.gametools.network/bf6/stats/`)

## 3. 機能仕様

### 3.1 データ取得と更新フロー
1.  **ページアクセス時**: Next.js の Server Component (`src/app/page.tsx`) がバックエンドロジック (`statsService.ts`) を呼び出す。
2.  **API通信**: `gametoolsService.ts` が GameTools API へリクエストを送り、最新の戦績データを取得する。
3.  **データベース比較**:
    *   取得したデータをデータベース（直近のレコード）と比較する。
    *   前回の取得からデータに変化（キル数の増加など）があった場合のみ、新しい履歴としてデータベースにINSERTする。
4.  **画面描画**: 最新のデータと、前回のデータとの「差分（トレンド）」を計算し、画面に描画する。

### 3.2 表示項目
*   **プレイヤー情報**: 名前、プラットフォーム
*   **主要ステータス**:
    *   K/D Ratio (キルデス比)
    *   KPM (1分あたりのキル数)
    *   DPM (1分あたりのダメージ)
    *   Win % (勝率)
    *   Score / Min (1分あたりのスコア)
*   **戦闘詳細**:
    *   Kills (キル数)
    *   Deaths (デス数)
    *   Headshots (ヘッドショット数)
    *   Revives (蘇生数)
    *   Assists (アシスト数)
*   **武器ランキング**:
    *   キル数が多い上位10件の武器を自動抽出。
    *   表示内容: 順位、武器画像、武器名、キル数、命中率。

## 4. データベース設計 (Prisma Schema)

### Player テーブル
プレイヤー情報を一意に管理するテーブル。
*   `id` (String): プライマリキー (UUID)
*   `trnId` (String): プレイヤーのユニークID (APIから取得)
*   `updatedAt` (DateTime): 更新日時
*   `createdAt` (DateTime): 作成日時

### PlayerStats テーブル
戦績の履歴を保存するテーブル。プレイヤーに1対多で紐づく。
*   `id` (String): プライマリキー (UUID)
*   `playerId` (String): 外部キー (Player.id)
*   `kills` (Int): キル数
*   `deaths` (Int): デス数
*   `kdRatio` (Float): K/D比
*   `headshots` (Int): ヘッドショット数
*   `winPct` (Float): 勝率
*   `scorePerMin` (Float): SPM
*   `kpm` (Float): KPM
*   `dpm` (Float): DPM
*   `revives` (Int): 蘇生数
*   `assists` (Int): アシスト数
*   `createdAt` (DateTime): 取得日時

### WeaponStats テーブル
各ステータス取得時の武器ごとの戦績を保存するテーブル。
*   `id` (String): プライマリキー (UUID)
*   `statsId` (String): 外部キー (PlayerStats.id)
*   `name` (String): 武器名
*   `kills` (Int): キル数
*   `accuracy` (Float): 命中率
*   `rank` (Int, Optional): 順位

## 5. UI/UX デザイン方針
*   **カラーパレット**: ダークモードを基調とし、背景は `#0a0a0a`〜`#111`、アクセントカラーにはサイバー感のあるブルー（`#3b82f6`）を使用。
*   **レイアウト**: ステータスや武器ランキングは、見やすさを重視した「テーブル（表）形式」で実装。
*   **トレンドインジケーター**: 値の増減を緑の上矢印（▲）や赤の下矢印（▼）で表現し、直感的なフィードバックを提供。
*   **レスポンシブ**: スマートフォンなど画面幅が狭いデバイスでも横スクロールを活用し、表が崩れないように設計。

## 6. 今後の拡張の可能性 (Future Work)
*   戦績推移のグラフ化（Chart.jsなどの導入）
*   ビークル（乗り物）統計の追加表示
*   複数のプレイヤーを登録・切り替えできる機能の追加
