# スマホアプリエンジニアのための Next.js (App Router) 入門

Android (Kotlin/Java) や iOS (Swift) のネイティブアプリ開発経験がある方向けに、今回作成した `Next.js` アプリケーションがどのような構造で動いているのかを対比しながら解説します。

---

## 1. 全体像：Next.js は「フロントエンド」と「バックエンド」が合体したもの

スマホアプリ開発では、手元の端末で動く「アプリ（フロント）」と、通信先の「サーバー（API）」が完全に分かれていることが多いと思います。
Next.jsの最大の特徴は、**「画面を作るコード（フロント）」と「DBからデータを取ってくるコード（バックエンド）」を1つのプロジェクト内で同居させられる**点にあります。

### 今回のアプリ（BF6MyTracker）の流れ
1. **ユーザーがURLを開く（Vercelのサーバーにリクエストが飛ぶ）**
2. **サーバー側で処理 (Server Component)**: 
   - サーバーの中で `statsService.ts` が動き、GameTools APIを叩いたり、Turso (DB) と通信したりします。
3. **HTMLの生成**: 
   - 取得したデータをHTMLの表（UI）に埋め込み、完成した画面（HTML/CSS）を作ります。
4. **ブラウザに返す**: 
   - スマホやPCのブラウザには「完成済みの画面」だけが送られます。そのため表示が非常に高速です。

---

## 2. 概念の対比表

| Next.js (React) の概念 | Android の概念 | iOS (SwiftUI / UIKit) の概念 |
| :--- | :--- | :--- |
| **Component (`.tsx`)** | `View` / `Fragment` / `Composable` | `View` (SwiftUI) / `UIView` |
| **Page (`app/page.tsx`)** | `Activity` | `UIViewController` |
| **App Router (`app/` フォルダ)** | `Intent` / `NavGraph` | `UINavigationController` |
| **CSS Modules (`.module.css`)** | `res/layout` (XML) / `Modifier` | `Storyboard` / `Modifier` |
| **Prisma (データベースORマッパー)** | `Room` | `CoreData` / `SwiftData` |
| **`package.json`** | `build.gradle` | `Podfile` / `Package.swift` |

---

## 3. 画面の作り方（React コンポーネント）

スマホアプリの `Jetpack Compose` (Android) や `SwiftUI` (iOS) を触ったことがあれば、Reactの仕組みは非常に似ています。これらはすべて「宣言的UI」という同じパラダイムで作られています。

**Next.js (React) の例：**
```tsx
// src/components/TrendIndicator.tsx
export default function TrendIndicator({ value }) {
  if (value > 0) {
    return <span className="text-green">▲ {value}</span>;
  } else if (value < 0) {
    return <span className="text-red">▼ {Math.abs(value)}</span>;
  }
  return <span>-</span>;
}
```
*↑ 状態（`value`）を受け取って、それに合わせて見た目（HTMLタグ）を返すだけのシンプルな関数です。*

---

## 4. ルーティング（画面遷移）の仕組み

Androidの `Intent` や iOSの `NavigationController` のようにコードで遷移先を指定するのではなく、Next.js (App Router) では**「フォルダの構造」がそのままURL（画面）**になります。

* `src/app/page.tsx` ＝ トップページ (`/`)
* `src/app/settings/page.tsx` ＝ 設定ページ (`/settings`)
* `src/app/users/[id]/page.tsx` ＝ ユーザー詳細ページ (`/users/123` など)

新しい画面を作りたければ、フォルダを作ってその中に `page.tsx` を置くだけでルーティングが完了します。

---

## 5. Server と Client の違い（一番の壁）

Next.js を触る上で一番戸惑うのが**「Server Component」**と**「Client Component」**の違いです。

### Server Component (デフォルト)
* **動く場所**: Vercelなどの「サーバー上」
* **特徴**: データベース (Prisma) に直接アクセスできます。APIキーなどの秘密情報を書いても、ブラウザには送信されないので安全です。
* **今回の例**: トップページの `src/app/page.tsx` はこれです。描画前にDBや外部API（GameTools）と通信しています。
* **制限**: スマホアプリの `onClick` のような「ボタンを押した時の処理」や `useEffect` のような画面描画後の処理は書けません。

### Client Component
* **動く場所**: ユーザーの「ブラウザ上（スマホやPC）」
* **特徴**: ファイルの一番上に `"use client";` と書きます。ボタンのクリック、アニメーション、状態管理（`useState`）など、ユーザーの操作に反応する処理が書けます。スマホアプリの UI スレッドで動く処理のイメージです。

---

## 6. データ管理（Prismaについて）

Androidの `Room` や iOSの `CoreData` に相当するのが、今回使った **Prisma** です。

1. `prisma/schema.prisma` というファイルに「テーブルの設計図」を書きます。
2. `npx prisma db push` コマンドで、実際のデータベース（Turso）にテーブルを作ります。
3. アプリのコードからは `prisma.playerStats.findFirst()` のように、SQLを書かずにメソッドを呼び出すだけでデータの取得や保存ができます。

```typescript
// データの保存例
const newRecord = await prisma.playerStats.create({
  data: {
    playerId: "xxxx",
    kills: 100,
  }
});
```

---

## 7. デプロイ（リリース）の仕組み

スマホアプリの場合は、ビルドした `.apk` や `.ipa` をストアに提出して審査を待ちますが、Webアプリ（Vercel）の場合はもっと簡単です。

1. コードを GitHub の `main` ブランチに Push（アップロード）する。
2. Vercel がそれを検知して、自動でクラウド上のサーバーでビルド（構築）を行う。
3. 数分後には全世界に最新版のURLが公開される。

そのため、「ちょっと文字を直したい」という時も、コードを直してPushするだけで数分後には全員のスマホで最新版が見れるようになります。

---

## まとめ

今回のアプリ（BF6MyTracker）は以下のように動いています。

1. Vercelのサーバーがリクエストを受け取る (`page.tsx`)
2. サーバーの中で、GameTools API から最新戦績を取得する。
3. サーバーの中で、Turso (データベース) から過去の戦績を取得して比較する。
4. HTMLの表を作り上げて、ユーザーのブラウザにサッと返す。

UIの作り方は SwiftUI や Jetpack Compose に非常に似ているため、フロントエンドの見た目をいじるのは比較的簡単に馴染めるはずです！
