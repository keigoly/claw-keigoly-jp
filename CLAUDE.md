# このリポジトリでの指示(claw-keigoly-jp)

「持たざる者による AI 黙示録」ブログ(Clawくん が毎日 1 本の episode を生成し、keigoly様 の DM 承認で公開)。公開先: https://claw.keigoly.jp/(Astro・GitHub Actions でデプロイ)。

## 母艦連携(必読)

- このディレクトリは母艦 `ai-context-engine` の**衛星** `claw-keigoly-jp` です。正本は母艦の登録簿 `/Users/Shared/Developments/ai-context-engine/claw_bot/config/projects.json`。
- **Discord**: `#claw-keigoly-jp`(Clawくん がこの衛星のプロジェクトカードを読んで応答する)。通知 source は `project:claw-keigoly-jp`。公開承認は従来どおり owner DM(`blog-approval`・変更なし)。
- **Vault**: `01_Projects/Claw_Blog/_Index.md`(プロジェクトカード)。SNS 投稿テンプレートは同フォルダの曜日別サブフォルダ(母艦の publisher が書く)。引き継ぎメモは `01_Projects/Claw_Blog/_Notes/`(旧 `04_Context/claw-keigoly-jp/` から 2026-09-03 に移動。04_Context は毎セッション全注入されるため)。決定は `Decisions.md` に追記。進行中タスクの動的状態は AIRFLOW board の `handoff_note`。
- **機微クラス**: `public`(記事は公開物。生成プロンプトに Vault の機微フォルダを混ぜない = 母艦 `blog/obsidian_today.py` の `_EXCLUDE_DIRS` が正本。ボードのタスクには `project:claw-keigoly-jp` タグ)。
- **連携型**: `C`(org/13 §6.5)。母艦のモジュールを import しない。母艦との境界は **母艦からの subprocess 呼び出し**: mini の launchd `com.keigoly.claw-blog-generate`(+ watchdog)が母艦 `blog/generate_episode.py` で草稿を作り、DM 承認後に母艦 `blog/publisher.py` がこの repo の `src/content/posts/` に MDX を書いて `git add / commit / push origin main` する(公開前の `astro build` ゲートは `node_modules` がある Air でのみ動く)。この repo の場所は母艦が登録簿 `projects.resolve_runtime_dir`(`blog/satellite_repo.py`・env `CLAW_BLOG_REPO_ROOT` で上書き可)で引く。母艦がこの repo に書くのは posts の MDX のみ。
- **母艦から借りるもの**: worktree 作成(`ai-context-engine/scripts/mac/new-worktree.sh`)・Air/mini 運用の前提(`ai-context-engine/docs/AIR_MINI_DEVOPS.md`)。それ以外の母艦コードには依存しない。

## 開発フロー

1. 共有ディレクトリなので、**新しいブランチは必ず専用 worktree** で作る。ブランチの正本は `main`。
2. 変更は user CLAUDE.md の Step 1(見える化)→ Step 2(最小改修)→ Step 3(周辺整合)の順。
3. mini がリーダー(org/13 D9)。この衛星は `sync: git` で **mini の `~/Developments/claw-keigoly-jp` が本番かつ書き手**(毎日の episode を commit/push)。Air は `git pull --ff-only` で追う。Air から push する時は必ず先に pull。Mutagen(Lane A)には乗せない。
4. サイトのビルド検証は **Air の `npm run build` が唯一の関門**(mini は `node_modules` 無しで skip)。1 本の MDX が壊れると astro が全ビルドを落とし、以降の記事が世に出ない(2026-08-13 に `</br>` で 17 日間凍結)。
5. 作業の終わりに `01_Projects/Claw_Blog/_Index.md` の「現状」「次の一手」を更新する。

## 禁止事項

- 母艦 `ai-context-engine` のコードを import する / 母艦 repo へ直接書き込む。
- 衛星のパスを母艦のコードに直書きする(登録簿経由にする)。
- posts の MDX に不正な閉じタグ(`</br>` 等)や壊れた frontmatter を入れる(astro build が全記事を巻き込んで落ちる)。
- 公開記事に Vault の非公開フォルダの内容を混ぜる(除外一覧は母艦 `blog/obsidian_today.py` の `_EXCLUDE_DIRS` が正本)。

## この衛星固有の指示

- 母艦側の経路: 生成 `blog/generate_episode.py`(mini・launchd)→ DM 承認 `claw_bot/tasks/blog_task.py` → 公開 `blog/publisher.py`(この repo へ push)→ GitHub Actions デプロイ。母艦のログ(`blog/logs/`)の `repo=… source=env|registry|legacy` で場所の出どころが分かる(`legacy` は登録簿が引けなかった印)。
- デプロイの成否は `gh run list -R keigoly/claw-keigoly-jp` で見る(母艦の `_watch_deploy` は成功時しか DM しない)。
- 引き継ぎメモ: Vault `01_Projects/Claw_Blog/_Notes/`(`2026-05-13_session.md`・`2026-05-26_kakuyomu-style-ingest.md`)。
