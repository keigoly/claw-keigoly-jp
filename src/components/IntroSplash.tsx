import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Phase = "idle" | "in" | "out" | "curtain";

export default function IntroSplash() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("intro-shown")) {
      setShow(false);
      return;
    }
    sessionStorage.setItem("intro-shown", "1");
    document.body.style.overflow = "hidden";

    setPhase("in");
    const t1 = setTimeout(() => setPhase("out"), 2000);
    const t2 = setTimeout(() => setPhase("curtain"), 2700);
    const t3 = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  const isOut = phase === "out" || phase === "curtain";

  return (
    <motion.div
      className="intro-splash"
      initial={{ y: "0%" }}
      animate={phase === "curtain" ? { y: "-100%" } : { y: "0%" }}
      transition={
        phase === "curtain"
          ? { duration: 1.1, ease: [0.76, 0, 0.24, 1] }
          : { duration: 0 }
      }
    >
      <div className="intro-grain" aria-hidden />
      <div className="intro-glow" aria-hidden />

      <div className="intro-center">
        <motion.p
          className="intro-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={
            isOut
              ? { opacity: 0, y: -20 }
              : phase === "in"
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 20 }
          }
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          持たざる者による AI 黙示録
        </motion.p>

        <motion.p
          className="intro-title"
          initial={{ opacity: 0 }}
          animate={
            isOut ? { opacity: 0 } : phase === "in" ? { opacity: 1 } : { opacity: 0 }
          }
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          Clawくんと歩む
        </motion.p>
      </div>
    </motion.div>
  );
}
