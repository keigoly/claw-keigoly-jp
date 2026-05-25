/**
 * Cloudflare Worker: コラム「スキ」グローバル共有カウント API。
 *
 * ルーティング: 静的アセットが先に配信され、未マッチのみ本 Worker が走る
 * （wrangler.toml: main + [assets] binding=ASSETS, [[kv_namespaces]] binding=LIKES）。
 *
 *   GET    /api/likes/<slug>  -> { slug, count }
 *   POST   /api/likes/<slug>  -> インクリメント -> { slug, count }
 *   DELETE /api/likes/<slug>  -> デクリメント   -> { slug, count }
 *
 * slug は Episode id（例: 2026-05-24_episode-009）に限定し、任意キー書込を防ぐ。
 * 重複スキ防止はクライアント側 localStorage に委ねる（匿名・低リスク運用）。
 */

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}
interface Fetcher {
  fetch(request: Request): Promise<Response>;
}
interface Env {
  LIKES: KVNamespace;
  ASSETS?: Fetcher;
}

const SLUG_RE = /^\d{4}-\d{2}-\d{2}_episode-\d{3}$/;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/likes\/(.+)$/);

    // /api/likes 以外は静的アセットへフォールバック（通常はアセットが先に配信される）
    if (!match) {
      return env.ASSETS
        ? env.ASSETS.fetch(request)
        : new Response("Not found", { status: 404 });
    }

    const slug = decodeURIComponent(match[1]);
    if (!SLUG_RE.test(slug)) {
      return json({ error: "invalid slug" }, 400);
    }
    const key = `likes:${slug}`;

    if (request.method === "GET") {
      const v = await env.LIKES.get(key);
      return json({ slug, count: v ? parseInt(v, 10) || 0 : 0 });
    }

    if (request.method === "POST" || request.method === "DELETE") {
      const cur = parseInt((await env.LIKES.get(key)) || "0", 10) || 0;
      const next = request.method === "POST" ? cur + 1 : Math.max(0, cur - 1);
      await env.LIKES.put(key, String(next));
      return json({ slug, count: next });
    }

    return json({ error: "method not allowed" }, 405);
  },
};
