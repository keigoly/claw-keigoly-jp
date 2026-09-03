# Claw Blog (claw.keigoly.jp) — DEVELOPMENT.md

## 1. このディレクトリの役割

「持たざる者による AI 黙示録」ブログ(https://claw.keigoly.jp/)の Astro サイト本体。記事(`src/content/posts/*.mdx`)は母艦 Clawくん が毎日 1 本生成し、keigoly様 の DM 承認を経て母艦の publisher がこの repo に commit/push する。GitHub Actions がビルド・デプロイする。

## 2. 母艦連携(写し。正本は母艦の登録簿 `claw_bot/config/projects.json`)

| 項目 | 値 |
|---|---|
| slug | `claw-keigoly-jp` |
| owner | 登録簿参照(非公開) |
| class | `public`(記事は公開物。生成プロンプトに Vault の機微を混ぜない) |
| runtime | `mini`(launchd `com.keigoly.claw-blog-generate` + watchdog・母艦の bot が承認を受ける) |
| sync | `git`(mini の `~/Developments/claw-keigoly-jp` が本番かつ書き手。Air は `pull --ff-only` で追う) |
| link(連携型) | `C`(org/13 §6.5・母艦 `blog/generate_episode.py` が草稿を作り、`blog/publisher.py` がこの repo に MDX を書いて `git push`) |
| Discord | `#claw-keigoly-jp`(公開承認は従来どおり owner DM `blog-approval`) |
| Vault カード | `01_Projects/Claw_Blog/_Index.md`(SNS テンプレートは同フォルダの曜日別サブフォルダ・引き継ぎメモは `_Notes/`) |
| data_dir(work のみ) | — |
| 母艦側アダプタ | `blog/publisher.py`・`blog/generate_episode.py`・`blog/satellite_repo.py`(場所の解決)・`claw_bot/tasks/blog_task.py`(承認)・`scripts/mac/blog_generate.sh`・`scripts/mac/launchd/com.keigoly.claw-blog-generate.plist` / `-watchdog.plist` |

登録簿とこの表がずれたら登録簿を正とし、この表を直す。2026-09-03 に衛星として契約(S6)。母艦はこの repo の場所を登録簿 `projects.resolve_runtime_dir`(`blog/satellite_repo.py`・env `CLAW_BLOG_REPO_ROOT` で上書き)で引く(旧: 2 ファイルに `REPO_ROOT` 直書き)。

## 3. 現在の問題点

- 母艦側: ep076(2026-07-31)が未承認のまま欠番 / 孤児草稿(`blog/state/draft_*.mdx`)の棚卸し未実施(母艦 memory 2026-08-13)。
- サイト: 1 本の MDX が壊れると astro が全ビルドを落とし以降の記事が世に出ない(2026-08-13 に `</br>` で 17 日間凍結)。事前検証は Air の `npm run build` のみ(mini は `node_modules` 無し)。

## 4. バグ修正時の手順(user CLAUDE.md 準拠・一気に直さない)

### Step 1: 調査とログ追加(見える化)
- 生成: 母艦 `blog/logs/`(`generate_start` / `repo= source=` / claude の rc)。公開: `blog_publish_*` ログと `gh run list -R keigoly/claw-keigoly-jp`(デプロイの成否。`_watch_deploy` は成功時しか DM しない)。
- 結果を確認してから Step 2 へ。

### Step 2: 原因箇所のみ最小限の改修
- 記事(MDX)の問題はこの repo、生成・承認・公開の問題は母艦 `blog/` と `claw_bot/tasks/blog_task.py`。同時に直さない。
- 結果を確認してから Step 3 へ。

### Step 3: 周辺の整合性確認と改修
- Air で `npm run build` → push → `gh run list` で緑を確認。Vault `01_Projects/Claw_Blog` の SNS テンプレート・カードの更新が要るか。
- 動作確認が終わるまで旧経路は残す。

## 5. 開発の作法

- 共有ディレクトリのため **新しいブランチは必ず専用 worktree** で(`/Users/Shared/Developments/ai-context-engine/scripts/mac/new-worktree.sh <branch>` を `REPO_ROOT=<この dir>` で呼ぶ)。正本は `main`。
- 母艦のコードを import しない。連携は C 型(母艦からの subprocess)に限る。
- mini がリーダー(org/13 D9)。この衛星は `sync: git` で mini の `~/Developments/claw-keigoly-jp` が書き手。Air から push する時は必ず先に `git pull --ff-only`。Mutagen には乗せない。

## 6. 関連ドキュメント

- 母艦: `ai-context-engine/org/13-satellite-projects.md`・`ai-context-engine/blog/`(生成・公開の実装)
- Vault カード: `01_Projects/Claw_Blog/_Index.md`・決定事項: `01_Projects/Claw_Blog/Decisions.md`・引き継ぎメモ: `01_Projects/Claw_Blog/_Notes/`
