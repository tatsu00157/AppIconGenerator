# Pikcel（旧称: App Icon Generator）

## 概要
単一の画像をアップロードし、複数サイズのアイコンを生成してZIP形式でダウンロードできるWebツール。

- 完全フロントエンド
- サーバー不要
- ログインなし
- 無料公開前提

---

## 目的
- アプリアイコン生成の効率化
- 海外ツールの代替（日本語UI）
- シンプルで高速なUX

---

## 実装状況

### ✅ 完了
- 画像アップロード（全画像形式対応・クリック & ドラッグ＆ドロップ）
- アップロード後プレビュー（サムネイル・ファイル名・画像サイズ・ファイルサイズ）
- 入力画像を 1024×1024px に限定（それ以外はエラー表示）
- 全27サイズを一括生成（Canvas リサイズ・高品質補間）
- ZIP ダウンロード（フラット構造 `icon_○○.png`）
- ZIP ファイル名を自由に入力できる（デフォルト: `app-icons`）
- プログレスバー（生成中のサイズをリアルタイム表示）
- 生成サイズ一覧をチップ形式で表示（`1024×1024` 形式）
- モバイル対応レイアウト
- サイトヘッダー・フッター（ホワイト。ヘッダー下部にピンクボーダー + コピーライト表示）
- ヘッダー直下に3ステップの使い方ガイド（カード形式）
- メインカラー：ピンク（`#E8185C`）
- favicon（SVG形式・Pレターマーク）
- SEO meta タグ・OGP・Twitter Card・構造化データ（JSON-LD）設定済み
- Google Analytics 設置済み（Measurement ID は要差し替え）
- プライバシーポリシーページ（`privacy.html`）
- sitemap.xml・robots.txt 作成済み
- ヘッダー：アイコン・ロゴをホームリンク化、ナビに「ホーム」追加
- フッター：プライバシーポリシー・お問い合わせをリンク表示（ピンク・下線）
- お問い合わせ：mailto にメール本文のテンプレート設定済み（件名保持の注記含む）

### ❌ 未実装（フェーズ2：サーバー導入後）
- 背景透過（機械学習）・高画質処理・バッチ処理

### 🔧 残対応
- OG画像を作成してホスティング（推奨サイズ：1200×630px。サービス名・説明文・Pアイコンを組み合わせた横長バナー）
- `og:image` / `twitter:image` を実際の OG画像 URL に更新

---

## 技術スタック
- HTML / Vanilla JavaScript / CSS
- JSZip（ZIP生成）`libs/jszip.min.js`
- FileSaver.js（ダウンロード）`libs/FileSaver.min.js`

---

## ディレクトリ構成
/project-root
  ├── index.html
  ├── privacy.html
  ├── style.css
  ├── main.js
  ├── favicon.svg
  ├── sitemap.xml
  ├── robots.txt
  ├── /libs
  │     ├── jszip.min.js
  │     └── FileSaver.min.js

---

## UI構成
- ヘッダー：ホワイト（アイコン+ロゴ=ホームリンク 左、タグライン中、ホームナビ 右、ピンク下ボーダー）
- 使い方ガイド：3ステップをカード形式で表示（バッジはパープル `#7C3AED`）
- 1. 画像アップロードエリア（クリック or ドラッグ＆ドロップ）→ アップロード後サムネイルに切り替わる
- 2. 生成されるサイズ一覧（チップ表示・固定・選択不可）
- 3. ZIPファイル名入力 + 生成 & ダウンロードボタン + プログレスバー
- フッター：ホワイト（プライバシーポリシー・お問い合わせリンク + コピーライト）

※プラットフォーム選択なし（全サイズ常時生成）

---

## サイズ定義（`main.js` の `ALL_SIZES`）

```js
const ALL_SIZES = [1024, 512, 256, 192, 180, 167, 152, 144, 128, 120, 114, 100, 96, 87, 80, 76, 72, 60, 58, 57, 50, 48, 40, 32, 29, 20, 16];
```

iOS・Android・Unity（AppIcon.appiconset）＋ファビコン（16, 32）の必要サイズを網羅。合計27サイズ。
サイズ変更はこの配列を編集するだけでOK（HTML のチップ表示も合わせて変更すること）。

---

## ZIP内ファイル構造（フラット）

```
icon_1024.png
icon_512.png
icon_256.png
...
icon_20.png
```

---

## 制約
- 入力サイズ：1024×1024px 限定（それ以外はエラー）
- ブラウザメモリ依存・大量処理非対応

---

## デプロイ

### 構成
- VPS（Rocky Linux / Apache）で公開済み
- URL：https://pikcel.karineffort.com/
- ドキュメントルート：`/var/www/pikcel`
- Apache設定：`/etc/httpd/conf.d/pikcel.conf`（HTTP→HTTPSリダイレクト）+ `pikcel-le-ssl.conf`（SSL・certbot生成）

### 自動デプロイ（git bare repo + post-receive）
VPS の `~/repos/pikcel.git` にベアリポジトリを設置。ローカルからpushするとpost-receiveフックが `/var/www/pikcel` に自動展開する。

**ローカルのリモート設定**
```
origin  → https://github.com/tatsu00157/AppIconGenerator.git
vps     → ユーザー名@133.117.73.175:repos/pikcel.git
```

**デプロイコマンド**
```bash
git push vps main
```

**フック（VPS: `~/repos/pikcel.git/hooks/post-receive`）**
```bash
#!/bin/bash
unset GIT_DIR
git --work-tree=/var/www/pikcel --git-dir=$HOME/repos/pikcel.git checkout main -f
```

---

## 方針
- まずはMVP優先
- シンプル実装
- サーバー機能は後から追加

---

## 会話ルール
- ユーザーから質問・相談をする形で進める
- Claude 側からユーザーに質問しない
