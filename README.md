# Clawくんと歩む — 持たざる者による AI 黙示録

> 公開 URL: https://claw.keigoly.jp/

エンジニアの keigoly と AI エージェント Clawくん が、毎日少しずつ這い上がる実録ドキュメンタリー。

## 技術スタック

- Astro 5（SSG）
- MDX（記事執筆）
- TailwindCSS 4
- Cloudflare Pages（ホスティング）
- @astrojs/rss（RSS フィード）
- @astrojs/sitemap（サイトマップ自動生成）

## ローカル開発

```bash
npm install
npm run dev
# → http://localhost:4321
```

## 本番ビルド

```bash
npm run build
npm run preview
```

## 記事を書く

`src/content/posts/` 配下に `.mdx` ファイルを追加。フロントマターは:

```yaml
---
title: 記事タイトル
pubDate: 2026-05-03
description: 概要 (OGP 用)
tags: [Clawくん, 持たざる者, 黙示録]
draft: false  # true なら公開しない
---
```

## 連載運用ルール

- **毎日 1 本**を目標
- **物語風** で keigoly 一人称 + Clawくん との対話混在
- **500〜1,500 字** を標準（短くても OK）
- 書けない日は翌日 2 本書いて埋める
- 連続記録のプレッシャーは持たない

## 関連リポジトリ

- メインプロジェクト: https://github.com/keigoly/ai-context-engine
- 公式サイト: https://github.com/keigoly/KeigolyOfficialSite
