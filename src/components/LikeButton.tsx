import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  /** Episode 識別子（post.id）。localStorage キーと API キーに使う。 */
  slug: string;
  /** "md": コラムページのタイトル付近 / "sm": アーカイブ一覧の各行。 */
  size?: "sm" | "md";
  /** true で押下不可（カウント表示専用）。アーカイブ一覧で使用。 */
  readOnly?: boolean;
  /**
   * グローバル共有カウント API ベース。既定 "/api/likes"（Cloudflare Worker + KV）。
   * GET `${apiBase}/${slug}` で合計取得、POST/DELETE で増減。
   * バックエンド未稼働時は fetch 失敗を握りつぶし、localStorage の liked のみ機能する。
   */
  apiBase?: string;
}

const storageKey = (slug: string) => `claw_suki_${slug}`;
const DEFAULT_API = "/api/likes";

// Material Design heart
const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

function FloatingHearts({ trigger }: { trigger: number }) {
  if (trigger === 0) return null;
  return (
    <div
      key={trigger}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = ((-90 + (i - 2) * 26) * Math.PI) / 180;
        const dist = 40 + (i % 2) * 12;
        return (
          <motion.span
            key={`${trigger}-${i}`}
            initial={{ opacity: 0.9, x: 0, y: 0, scale: 0.4 }}
            animate={{
              opacity: 0,
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist - 8,
              scale: 1,
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute"
            style={{ color: "var(--color-claw)", fontSize: 12, lineHeight: 1 }}
          >
            ♥
          </motion.span>
        );
      })}
    </div>
  );
}

export default function LikeButton({
  slug,
  size = "md",
  readOnly = false,
  apiBase = DEFAULT_API,
}: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);

  const md = size === "md";
  const icon = md ? 22 : 16;

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(storageKey(slug)) === "1");
    } catch {
      /* localStorage 不可環境は無視 */
    }
    if (apiBase) {
      fetch(`${apiBase}/${encodeURIComponent(slug)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && typeof d.count === "number") setCount(d.count);
        })
        .catch(() => {});
    }
  }, [slug, apiBase]);

  const toggle = useCallback(() => {
    const next = !liked;
    setLiked(next);
    try {
      if (next) localStorage.setItem(storageKey(slug), "1");
      else localStorage.removeItem(storageKey(slug));
    } catch {
      /* noop */
    }
    if (next) setBurst((b) => b + 1);
    // 楽観的更新（合計が既知のときのみ）
    setCount((c) => (c == null ? c : Math.max(0, c + (next ? 1 : -1))));
    if (apiBase) {
      fetch(`${apiBase}/${encodeURIComponent(slug)}`, {
        method: next ? "POST" : "DELETE",
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && typeof d.count === "number") setCount(d.count);
        })
        .catch(() => {});
    }
  }, [liked, slug, apiBase]);

  const sharedStyle = {
    gap: md ? 9 : 6,
    padding: md ? "8px 16px 8px 13px" : "3px 10px 3px 8px",
    border: `1.5px solid ${liked ? "var(--color-claw)" : "var(--color-line)"}`,
    background: liked ? "var(--color-claw-soft)" : "var(--color-paper)",
    transition: "background-color .25s, border-color .25s",
    lineHeight: 1,
  } as const;

  const heart = (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: icon, height: icon }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        width={icon}
        height={icon}
        aria-hidden="true"
        animate={{ scale: !readOnly && liked ? [1, 1.35, 1] : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        fill={liked ? "var(--color-claw)" : "none"}
        stroke={liked ? "var(--color-claw)" : "var(--color-fade)"}
        strokeWidth={2}
        strokeLinejoin="round"
      >
        <path d={HEART_PATH} />
      </motion.svg>
      {!readOnly && <FloatingHearts trigger={burst} />}
    </span>
  );

  const label = (
    <span
      style={{
        fontFamily: "var(--font-heading)",
        fontWeight: 700,
        fontSize: md ? 15 : 13,
        color: liked ? "var(--color-claw)" : "var(--color-fade)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {md ? "スキ" : ""}
      {count != null ? `${md ? " " : ""}${count}` : ""}
    </span>
  );

  // アーカイブ等の表示専用（押下不可）
  if (readOnly) {
    return (
      <div
        className="relative inline-flex items-center rounded-full align-middle"
        aria-label={`スキ${count != null ? ` ${count}` : ""}`}
        style={{ ...sharedStyle, cursor: "default" }}
      >
        {heart}
        {label}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? "スキを取り消す" : "スキ"}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      className="relative inline-flex items-center rounded-full align-middle"
      style={{ ...sharedStyle, cursor: "pointer" }}
    >
      {heart}
      {label}
    </motion.button>
  );
}
