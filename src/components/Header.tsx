import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "最新", href: "/latest/" },
  { name: "アーカイブ", href: "/posts/" },
  { name: "Clawくんとは", href: "/about/" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasHero, setHasHero] = useState(false);

  useEffect(() => {
    setHasHero(document.querySelector(".hero-dusk") !== null);
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "py-3" : "py-5"
        }`}
        style={{
          background: isScrolled || !hasHero ? "rgba(12, 10, 20, 0.88)" : "transparent",
          backdropFilter: isScrolled || !hasHero ? "blur(12px)" : "none",
          borderBottom: isScrolled || !hasHero ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* ロゴ */}
          <a href="/" className="hidden md:flex items-center gap-3 group">
            <img
              src="/claw-icon.jpeg"
              alt="Clawくん"
              className="w-8 h-8 rounded-full object-cover border border-white/20 group-hover:border-[var(--color-claw)] transition-colors duration-300"
              draggable="false"
            />
            <span
              className="hidden md:inline text-white/90 text-sm font-bold tracking-wide group-hover:text-white transition-colors duration-300"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Clawくんと歩む
            </span>
          </a>

          {/* デスクトップナビ */}
          <nav className="hidden md:flex items-center">
            {navItems.map((item, index) => (
              <div key={item.name} className="flex items-center">
                {index > 0 && (
                  <span className="text-white/20 mx-4 text-xs select-none">|</span>
                )}
                <a
                  href={item.href}
                  className="text-xs tracking-[0.18em] text-white/50 hover:text-[var(--color-claw)] transition-colors duration-300"
                  style={{ fontFamily: "var(--font-jp)" }}
                >
                  {item.name}
                </a>
              </div>
            ))}
            <span className="text-white/20 mx-4 text-xs select-none">|</span>
            <a
              href="/rss.xml"
              className="text-white/35 hover:text-[#ee802f] transition-colors duration-300"
              aria-label="RSS フィード"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="3.5" ry="3.5" />
                <path
                  fill="rgba(12,10,20,1)"
                  d="M6.5 17a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zm-.65-7.55c0-.5.4-.95.9-.95 4.6 0 8.35 3.75 8.35 8.35 0 .5-.45.9-.95.9s-.9-.4-.9-.9c0-3.6-2.95-6.55-6.5-6.55-.5 0-.9-.45-.9-.85zm0-3.55c0-.5.4-.95.9-.95C14.5 4.95 19 9.45 19 14.95c0 .5-.45.9-.95.9s-.9-.4-.9-.9C17.15 10.4 13.5 6.85 8.95 6.85c-.5 0-.9-.45-.9-.85z"
                />
              </svg>
            </a>
          </nav>

          {/* ハンバーガー（モバイル） */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            aria-label="メニューを開く"
          >
            <motion.span
              animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-white/75 block"
            />
            <motion.span
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-0.5 bg-white/75 block"
            />
            <motion.span
              animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-white/75 block"
            />
          </button>
        </div>
      </header>

      {/* モバイルメニュー */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 md:hidden flex flex-col items-center justify-center gap-10"
            style={{ background: "rgba(6, 4, 10, 0.97)", backdropFilter: "blur(16px)" }}
          >
            {navItems.map((item, i) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl text-white/65 hover:text-[var(--color-claw)] transition-colors tracking-[0.12em]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {item.name}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
