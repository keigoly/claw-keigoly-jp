// 記事(src/content/posts/ 配下の MDX)を 1 本ずつ独立に検査し、問題を全件まとめて表示する。
// astro build は最初のエラー 1 件で止まるため、壊れた記事が複数あると 1 本ずつしか分からない。
// この検査はビルドの前に走らせ、1 件でも問題があれば終了コード 1 で止める(黙って公開しない)。
//
// 使い方: node scripts/check-posts.mjs [ファイルまたはディレクトリ ...](既定: src/content/posts)
import { readdir, readFile, stat, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { parseFrontmatter } from "@astrojs/markdown-remark";
import { z } from "astro/zod";

// src/content.config.ts の posts スキーマの複製。あちらを変えたらここも合わせる
// (ずれても最後の astro build で捕まる)。
const postSchema = z.object({
  title: z.string(),
  pubDate: z.coerce.date(),
  description: z.string(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  series: z.string().optional(),
  episode: z.number().optional(),
  ogImage: z.string().optional(),
});

// MDX の本文で定義なしに使える名前(MDXContent の引数と Astro が足す export)
const BUILTIN_NAMES = new Set(["props", "frontmatter"]);

function lineColAt(text, offset) {
  const before = text.slice(0, offset);
  const line = before.split("\n").length;
  return { line, col: offset - before.lastIndexOf("\n") };
}

function walk(node, fn) {
  fn(node);
  for (const child of node.children ?? []) walk(child, fn);
}

// estree の中で、値として参照されている名前と、その式の中で宣言された名前を集める
function collectNames(node, used, declared, parent = null, key = null) {
  if (!node || typeof node.type !== "string") return;
  if (node.type === "Identifier") {
    const isPropertyName = (key === "property" && parent.type === "MemberExpression" && !parent.computed) || (key === "key" && !parent.computed);
    const isDeclaration = key === "id" || key === "params" || (key === "param" && parent.type === "CatchClause");
    if (isDeclaration) declared.add(node.name);
    else if (!isPropertyName && key !== "label") used.add(node.name);
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === "loc" || k === "range" || k === "comments") continue;
    if (Array.isArray(v)) for (const c of v) collectNames(c, used, declared, node, k);
    else if (v && typeof v === "object") collectNames(v, used, declared, node, k);
  }
}

// 構文としては通るが、ビルドか表示が壊れるものを拾う remark プラグイン
function remarkPostChecks({ filePath, problems }) {
  return (tree, file) => {
    const source = String(file.value);
    const report = (offset, msg) => problems.push({ ...lineColAt(source, offset), msg });

    const defined = new Set(BUILTIN_NAMES);
    let snsComment;
    walk(tree, (node) => {
      if (node.type === "mdxjsEsm") {
        for (const stmt of node.data?.estree?.body ?? []) {
          if (stmt.type === "ImportDeclaration") {
            for (const s of stmt.specifiers) defined.add(s.local.name);
            const src = stmt.source.value;
            if (src.startsWith(".") && !existsSync(path.resolve(path.dirname(filePath), src))) {
              report(node.position.start.offset, `import 先のファイルがありません: ${src}`);
            }
          } else if (stmt.type === "ExportNamedDeclaration" && stmt.declaration) {
            const d = stmt.declaration;
            if (d.id?.name) defined.add(d.id.name);
            for (const v of d.declarations ?? []) if (v.id?.type === "Identifier") defined.add(v.id.name);
          }
        }
      }
      if ((node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") && /^\s*\/\*\s*SNS_TEMPLATES/.test(node.value)) {
        snsComment = node;
      }
    });

    walk(tree, (node) => {
      // 閉じていないコードフェンス: 以降の本文がすべてコードブロックとして公開される
      if (node.type === "code") {
        const lines = source.slice(node.position.start.offset, node.position.end.offset).split("\n");
        const open = /^ {0,3}(`{3,}|~{3,})/.exec(lines[0]);
        if (open) {
          const fence = open[1];
          const closing = new RegExp(`^(${fence[0] === "`" ? "`" : "~"}){${fence.length},}\\s*$`);
          const last = lines.at(-1).replace(/^[\s>]*/, "");
          if (lines.length < 2 || !closing.test(last)) {
            report(node.position.start.offset, `コードフェンス ${fence} が閉じていません(以降の本文がすべてコードとして表示されます)`);
          }
        }
      }
      // import していないコンポーネント: ビルド時に "Expected component ... to be defined" で落ちる
      if ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && /^[A-Z]/.test(node.name ?? "")) {
        if (!defined.has(node.name.split(".")[0])) {
          report(node.position.start.offset, `<${node.name}> が import されていません`);
        }
      }
      // { } の中の未定義の名前: ビルド時に ReferenceError で落ちる
      if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
        const used = new Set();
        const declared = new Set();
        collectNames(node.data?.estree, used, declared);
        const free = [...used].filter((n) => !defined.has(n) && !declared.has(n) && !(n in globalThis));
        if (free.length) {
          report(node.position.start.offset, `{ } の中に定義されていない名前があります: ${free.join(", ")}(地の文の { } は \\{ \\} と書きます)`);
        }
      }
    });

    // SNS テンプレートのコメント(*/})より後ろの本文: 草稿の後書きなどが公開ページに出てしまう
    if (snsComment) {
      const rest = source.slice(snsComment.position.end.offset);
      const i = rest.search(/\S/);
      if (i !== -1) {
        report(snsComment.position.end.offset + i, "SNS テンプレートのコメント(*/})の後ろに本文があります(草稿の後書きなどが公開されます)");
      }
    }
  };
}

async function checkPost(filePath) {
  const problems = [];
  const code = await readFile(filePath, "utf8");

  // frontmatter より前の行数(通常は 0)。エラーの行番号を元のファイルに合わせるのに使う
  const leadingLines = code.slice(0, Math.max(code.indexOf("---"), 0)).split("\n").length - 1;

  let parsed;
  try {
    parsed = parseFrontmatter(code, { frontmatter: "empty-with-spaces" });
  } catch (e) {
    problems.push({
      line: e.mark ? leadingLines + e.mark.line + 1 : 1,
      col: e.mark ? e.mark.column + 1 : 1,
      msg: `frontmatter の YAML が読めません: ${e.reason ?? e.message}`,
    });
    return problems;
  }

  if (!parsed.rawFrontmatter) {
    const msg = /^\uFEFF?\s*---/.test(code)
      ? "frontmatter の閉じの --- が見つかりません"
      : "frontmatter(先頭の --- で囲んだ title / pubDate / description)がありません";
    problems.push({ line: 1, col: 1, msg });
    return problems;
  }

  const result = postSchema.safeParse(parsed.frontmatter);
  if (!result.success) {
    const keyLines = new Map();
    parsed.rawFrontmatter.split("\n").forEach((l, i) => {
      const m = /^([A-Za-z_][\w-]*)\s*:/.exec(l);
      if (m && !keyLines.has(m[1])) keyLines.set(m[1], leadingLines + i + 1);
    });
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "");
      problems.push({ line: keyLines.get(key) ?? leadingLines + 1, col: 1, msg: `frontmatter の ${issue.path.join(".") || "(全体)"}: ${issue.message}` });
    }
  }

  try {
    await compile(
      { value: parsed.content, path: filePath },
      {
        format: filePath.endsWith(".md") ? "md" : "mdx",
        remarkPlugins: [remarkGfm, [remarkPostChecks, { filePath, problems }]],
      },
    );
  } catch (e) {
    problems.push({ line: e.line ?? 1, col: e.column ?? 1, msg: `MDX として読めません: ${e.reason ?? e.message}` });
  }

  return problems.sort((a, b) => a.line - b.line || a.col - b.col);
}

async function listPosts(targets) {
  const files = [];
  for (const t of targets) {
    if ((await stat(t)).isDirectory()) {
      for (const f of await readdir(t, { recursive: true })) if (/\.mdx?$/.test(f)) files.push(path.join(t, f));
    } else {
      files.push(t);
    }
  }
  return files.sort();
}

// GitHub Actions のアノテーション用のエスケープ
const escapeData = (s) => s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const escapeProp = (s) => escapeData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");

const targets = process.argv.slice(2);
const files = await listPosts(targets.length ? targets : ["src/content/posts"]);
const started = performance.now();
const failed = [];
for (const file of files) {
  const problems = await checkPost(file);
  if (problems.length) failed.push({ file: path.relative(process.cwd(), file), problems });
}
const seconds = ((performance.now() - started) / 1000).toFixed(1);

for (const { file, problems } of failed) {
  for (const p of problems) {
    console.log(`${file}:${p.line}:${p.col}  ${p.msg}`);
    if (process.env.GITHUB_ACTIONS === "true") {
      console.log(`::error file=${escapeProp(file)},line=${p.line},col=${p.col},title=記事の検査::${escapeData(p.msg)}`);
    }
  }
}

const count = failed.reduce((n, f) => n + f.problems.length, 0);
const summary = failed.length
  ? `記事の検査: ${files.length} 本中 ${failed.length} 本に問題があります(${count} 件・${seconds} 秒)。ビルドに進みません。`
  : `記事の検査: ${files.length} 本すべて問題ありません(${seconds} 秒)。`;
console.error(summary);

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = failed.flatMap(({ file, problems }) => problems.map((p) => `| \`${file}:${p.line}:${p.col}\` | ${p.msg.replace(/\|/g, "\\|")} |`));
  const md = [`### ${summary}`, ...(rows.length ? ["", "| 場所 | 内容 |", "|---|---|", ...rows] : []), ""].join("\n");
  await appendFile(process.env.GITHUB_STEP_SUMMARY, md);
}

process.exit(failed.length ? 1 : 0);
