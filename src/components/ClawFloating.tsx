import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ClawFloating() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      setProgress(p);
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const size = 80;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const inset = stroke + 2;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 pointer-events-none"
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 12,
        scale: visible ? 1 : 0.9,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ y: { repeat: Infinity, duration: 2.4, ease: "easeInOut" } }}
        className="pointer-events-auto relative rounded-full border-0 p-0 bg-transparent cursor-pointer"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          filter: "drop-shadow(0 10px 24px rgba(231, 76, 60, 0.45))",
        }}
        aria-label="ページの先頭に戻る"
        title="ページの先頭に戻る"
      >
        <svg
          className="absolute inset-0 pointer-events-none"
          width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="rgba(231, 76, 60, 0.18)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="var(--color-claw)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - progress)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.15s linear" }}
          />
        </svg>
        <img
          src="/claw-icon.jpeg"
          alt="Clawくん"
          className="absolute rounded-full object-cover bg-white"
          style={{
            top: `${inset}px`,
            left: `${inset}px`,
            width: `calc(100% - ${inset * 2}px)`,
            height: `calc(100% - ${inset * 2}px)`,
          }}
          draggable={false}
        />
      </motion.button>
    </motion.div>
  );
}
