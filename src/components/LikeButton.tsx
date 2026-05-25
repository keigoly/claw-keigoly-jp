import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  /** Episode 識別子（post.id）。localStorage キーと将来の API キーに使う。 */
  slug: string;
  /**
   * 将来のグローバル共有カウント用 API ベース（例: "/api/likes"）。
   * 未指定ならローカルのみ（localStorage で「スキした」を保持し、合計数は非表示）。
   * 指定すると GET `${apiBase}/${slug}` で合計取得、POST/DELETE で増減する。
   */
  apiBase?: string;
}

const storageKey = (slug: string) => `claw_suki_${slug}`;

// Material Design heart
const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

function FloatingHearts({ trigger }: { trigger: number }) {
  if (trigger === 0) return null;
  const hearts = [0, 1, 2, 3, 4];
  return (
    <div
      key={trigger}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {hearts.map((i) => {
        const angleDeg = -90 + (i - 2) * 26;
        const angle = (angleDeg * Math.PI) / 180;
        const dist = 44 + (i % 2) * 12;
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
            style={{ color: "var(--color-claw)", fontSize: 13, lineHeight: 1 }}
          >
            ♥
          </motion.span>
        );
      })}
    </div>
  );
}

export default function LikeButton({ slug, apiBase }: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);

  // マウント時: localStorage から liked 復元 + (apiBase あれば) 合計取得
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
    // ローカルのみ運用時は合計数を表示しない（count は null のまま）。
  }, [liked, slug, apiBase]);

  return (
    <div className="flex flex-col items-center gap-2 my-14">
      <div className="relative">
        <motion.button
          type="button"
          onClick={toggle}
          aria-pressed={liked}
          aria-label={liked ? "スキを取り消す" : "スキ"}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.05 }}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 76,
            height: 76,
            border: `2px solid ${liked ? "var(--color-claw)" : "var(--color-line)"}`,
            background: liked ? "var(--color-claw-soft)" : "var(--color-paper)",
            transition: "background-color .25s, border-color .25s",
            cursor: "pointer",
          }}
        >
          <motion.svg
            viewBox="0 0 24 24"
            width="34"
            height="34"
            aria-hidden="true"
            animate={{ scale: liked ? [1, 1.35, 1] : 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            fill={liked ? "var(--color-claw)" : "none"}
            stroke={liked ? "var(--color-claw)" : "var(--color-fade)"}
            strokeWidth={2}
            strokeLinejoin="round"
          >
            <path d={HEART_PATH} />
          </motion.svg>
        </motion.button>
        <AnimatePresence>
          <FloatingHearts trigger={burst} />
        </AnimatePresence>
      </div>
      <span
        className="text-sm font-bold tracking-wider"
        style={{
          fontFamily: "var(--font-heading)",
          color: liked ? "var(--color-claw)" : "var(--color-fade)",
        }}
      >
        スキ{count != null ? ` ${count}` : ""}
      </span>
    </div>
  );
}
