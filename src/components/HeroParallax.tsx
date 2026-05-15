import { motion, useScroll, useTransform, useMotionValue, animate as fmAnimate } from "framer-motion";
import { useRef, useEffect } from "react";

export default function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.5, 0]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const clawY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const clawX = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const clawScrollOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  const sidebarY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const sidebarOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);

  // 入場アニメーション用 MotionValue（毎ページロードで実行）
  const photoOpacityMV = useMotionValue(0);
  const photoXMV = useMotionValue(60);
  const clawEntranceMV = useMotionValue(0);

  useEffect(() => {
    const c1 = fmAnimate(photoOpacityMV, 1, { duration: 1.1, delay: 0.3, ease: "easeOut" });
    const c2 = fmAnimate(photoXMV, 0, { duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] });
    const c3 = fmAnimate(clawEntranceMV, 1, { duration: 0.9, delay: 0.65, ease: "easeOut" });
    return () => { c1.stop(); c2.stop(); c3.stop(); };
  }, []);

  // Clawくん opacity = 入場(0→1) × スクロール(1→0.6) の合成
  const clawOpacity = useTransform(
    [clawEntranceMV, clawScrollOpacity],
    ([e, s]) => (e as number) * (s as number)
  );

  const today = new Date();
  const dateLabel = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div ref={ref} className="hero-dusk">
      <div className="hero-dusk-grain" aria-hidden />
      <div className="hero-dusk-glow" aria-hidden />
      <div className="hero-dusk-grid" aria-hidden />

      <motion.aside
        className="hero-dusk-sidebar hero-dusk-sidebar-left"
        style={{ y: sidebarY, opacity: sidebarOpacity }}
      >
        <span className="hero-dusk-vmark">EPISODE / 0001</span>
        <span className="hero-dusk-vmark hero-dusk-vmark-dim">{dateLabel}</span>
      </motion.aside>

      <motion.aside
        className="hero-dusk-sidebar hero-dusk-sidebar-right"
        style={{ y: sidebarY, opacity: sidebarOpacity }}
      >
        <span className="hero-dusk-vmark">KEIGOLY × CLAW</span>
        <span className="hero-dusk-crosshair" aria-hidden>+</span>
      </motion.aside>

      <div className="hero-dusk-stage">
        <motion.h1
          className="hero-dusk-megatype"
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <span className="hero-dusk-mega-line">Clawくんと</span>
          <span className="hero-dusk-mega-line hero-dusk-mega-accent">歩む</span>
        </motion.h1>

        {/* keigoly: 右からスライド + フェードイン */}
        <motion.figure
          className="hero-dusk-photo"
          style={{ y: photoY, scale: photoScale, opacity: photoOpacityMV, x: photoXMV }}
        >
          <img src="/keigoly-walking.png" alt="keigoly" />
        </motion.figure>

        {/* Clawくん: フェードイン（スクロール視差と合成） */}
        <motion.figure
          className="hero-dusk-claw"
          style={{ y: clawY, x: clawX, opacity: clawOpacity }}
        >
          <img src="/claw-lookup.png" alt="Clawくん" />
        </motion.figure>

        <motion.div
          className="hero-dusk-strap"
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <div className="hero-dusk-strap-left">
            <p className="hero-dusk-tagline">
              <span className="hero-dusk-tag-mark">—</span> 持たざる者による AI 黙示録
            </p>
            <p className="hero-dusk-credit">written &amp; lived by keigoly</p>
          </div>
          <a href="#latest" className="hero-dusk-cta">
            <span>最新の歩みを読む</span>
            <span className="hero-dusk-cta-arrow" aria-hidden>→</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
