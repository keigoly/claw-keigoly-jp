# docs/mock — claw.keigoly.jp のモック

## 役割

本番実装ではなく、方向性の合意用の単一 HTML。Artifact(claude.ai)に公開してレビューする。
Artifact は `<body>` の中身だけを受け取るので、ローカルで見る時は `<!doctype html>...` のラッパーで包む。

| ファイル | 内容 | Artifact |
|---|---|---|
| `archive-monthly.html` | アーカイブ(`/posts/`)の月別ビュー。月タブ(件数付き)→ その月をカレンダー / リストで表示。前月・翌月ナビ、`#YYYY-MM` で直リンク。実データ 123 篇(2026-05-01〜09-16)を JS 配列に埋め込み | https://claude.ai/artifact/WxWszgBksUVoFEcy5hU8vT |

## 現在の問題点

- 埋め込みデータは 2026-09-16 時点の frontmatter を手で抽出したもの。本実装では `getCollection("posts")` から生成する
- 「いいね」(LikeButton)はモックに含めていない

## バグ修正の手順(user CLAUDE.md Step 1〜3)

1. **見える化**: ラッパーで包んで headless Chrome で描画し、崩れを特定する(`--window-size` は 500px 未満にできないので、スマホ幅は実機か DevTools で確認)
2. **最小限の改修**: 該当の CSS/JS だけを直す
3. **周辺確認**: Artifact へ同じファイルパスで再公開 → 実機確認 → Vault `01_Projects/Claw_Blog` に決定を残す

## 関連ドキュメント

- リポジトリ `CLAUDE.md` / `DEVELOPMENT.md`
- 現行のアーカイブ実装: `src/pages/posts/index.astro`(月見出し付きの 1 本縦積み)
- デザイントークン: `src/styles/global.css`(`@theme`)
