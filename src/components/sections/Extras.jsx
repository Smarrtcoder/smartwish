import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Confetti from "react-confetti";
import { Sparkles } from "lucide-react";
import { COMPLIMENTS, METER_REASONS } from "../../data";
import { Typewriter } from "../Ambience";
import { Header } from "./Story";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/* ---- Floating decorations around the compliment card ---- */
const FLOAT_EMOJIS = ["🌸", "♡", "✦", "❀", "✧", "♡", "·", "⋆"];
const FLOAT_COLORS = ["#f9a8d4", "#f5c451", "#c4b5fd", "#ffffff", "#f9a8d4", "#f5c451", "#c4b5fd", "#ffffff"];

function FloatingDecor() {
  const items = useRef(
    Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      x: rand(3, 95),
      y: rand(5, 90),
      size: rand(8, 14),
      dur: rand(4, 8),
      delay: rand(0, 3),
      drift: rand(-12, 12),
    }))
  ).current;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((it) => (
        <motion.span
          key={it.id}
          className="absolute"
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            fontSize: it.size,
            color: FLOAT_COLORS[it.id % FLOAT_COLORS.length],
            textShadow: `0 0 6px ${FLOAT_COLORS[it.id % FLOAT_COLORS.length]}, 0 0 12px ${FLOAT_COLORS[it.id % FLOAT_COLORS.length]}`,
          }}
          animate={{
            opacity: [0, 0.7, 0],
            y: [0, it.drift, 0],
            scale: [0.6, 1, 0.6],
          }}
          transition={{ duration: it.dur, delay: it.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {FLOAT_EMOJIS[it.id % FLOAT_EMOJIS.length]}
        </motion.span>
      ))}
    </div>
  );
}

export function Compliments() {
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState(false);
  const next = () => {
    let n;
    do { n = Math.floor(Math.random() * COMPLIMENTS.length); } while (n === idx && COMPLIMENTS.length > 1);
    setFlip(true);
    setTimeout(() => { setIdx(n); setFlip(false); }, 300);
  };
  return (
    <section className="relative py-24 px-6" data-testid="compliments-section">
      <Header emoji="💖" title="Infinite Compliments" subtitle="Because one compliment is never enough. 😊" />
      <div className="max-w-lg mx-auto flex flex-col items-center">
        {/* Small elegant label */}
        <motion.p
          className="font-hand text-base md:text-lg mb-5 text-center"
          style={{ color: "#f5c451", textShadow: "0 0 10px rgba(245,196,81,0.4)" }}
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          ♡ A Little Compliment For You ♡
        </motion.p>

        {/* Magic glass card with border shimmer + floating decor */}
        <div className="relative w-full">
          <FloatingDecor />

          {/* Soft pink/golden glow behind the card */}
          <div className="absolute inset-0 -z-10 blur-3xl opacity-50" style={{ background: "radial-gradient(circle at 50% 50%, rgba(236,72,153,0.2), rgba(245,196,81,0.15), transparent 70%)" }} />

          {/* Border shimmer — light travelling around the card edge */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: "linear-gradient(110deg, transparent 35%, rgba(255,240,200,0.25) 50%, transparent 65%)",
              backgroundSize: "250% 100%",
              borderRadius: 24,
            }}
            animate={{ backgroundPosition: ["250% 0", "-250% 0"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          />

          <motion.div
            className="relative crystal-glass rounded-3xl p-8 md:p-10 w-full min-h-[200px] flex items-center justify-center text-center"
            style={{
              border: "1px solid rgba(245,196,81,0.25)",
              boxShadow: "0 16px 50px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.08), 0 0 50px rgba(236,72,153,0.12), 0 0 30px rgba(245,196,81,0.1)",
            }}
            animate={{ rotateY: flip ? 90 : 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Decorative quote mark */}
            <span className="absolute top-3 left-5 font-serif-display text-3xl" style={{ color: "rgba(245,196,81,0.2)" }}>"</span>
            <span className="absolute bottom-1 right-5 font-serif-display text-3xl" style={{ color: "rgba(245,196,81,0.2)" }}>"</span>

            <p className="font-body text-lg md:text-xl text-[#f5edd6] whitespace-pre-line leading-relaxed tracking-wide" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
              <Typewriter key={idx} text={COMPLIMENTS[idx]} speed={8} />
            </p>
          </motion.div>
        </div>

        {/* Premium "Another one" button with glow + shimmer */}
        <div className="relative mt-6">
          {/* Shimmer sweep on the button */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
            style={{
              background: "linear-gradient(110deg, transparent 30%, rgba(255,240,200,0.3) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
            }}
            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          />
          <motion.button
            data-testid="compliment-button"
            onClick={next}
            whileHover={{ scale: 1.05, boxShadow: "0 16px 50px rgba(139,92,246,0.55), 0 0 40px rgba(245,196,81,0.3)" }}
            whileTap={{ scale: 0.96 }}
            className="relative px-8 py-3 rounded-full font-body font-semibold text-white flex items-center gap-2"
            style={{
              background: "linear-gradient(120deg,#8b5cf6,#ec4899)",
              border: "1px solid rgba(245,196,81,0.3)",
            }}
            animate={{
              boxShadow: [
                "0 10px 30px rgba(139,92,246,0.4), 0 0 20px rgba(236,72,153,0.2)",
                "0 12px 40px rgba(139,92,246,0.55), 0 0 30px rgba(245,196,81,0.25)",
                "0 10px 30px rgba(139,92,246,0.4), 0 0 20px rgba(236,72,153,0.2)",
              ],
            }}
            transition={{ boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
          >
            <Sparkles size={18} /> Another one
          </motion.button>
        </div>
      </div>
    </section>
  );
}

export function BestFriendMeter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const id = setInterval(() => {
      v += 3;
      if (v >= 99) { v = 99; clearInterval(id); setTimeout(() => { setPct(100); setDone(true); }, 800); }
      setPct(v);
    }, 30);
    return () => clearInterval(id);
  }, [inView]);
  return (
    <section ref={ref} className="relative py-24 px-6" data-testid="meter-section">
      {done && <Confetti recycle={false} numberOfPieces={200} colors={["#f472b6", "#8b5cf6", "#f5c451", "#fff"]} />}
      <Header emoji="📊" title="Best Friend Meter" subtitle="Scientifically inaccurate... emotionally 100% correct. 😂" />
      <div className="max-w-md mx-auto glass rounded-3xl p-8 text-center">
        <p className="font-serif-display text-6xl font-bold grad-text mb-3">{pct}%</p>
        <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden mb-6">
          <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#f472b6,#8b5cf6,#f5c451)" }}
            animate={{ width: `${pct}%` }} transition={{ ease: "easeOut" }} />
        </div>
        <p className="font-body text-xs uppercase tracking-widest text-[#f5c451] mb-1">Best Friend Compatibility</p>
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-2 gap-2 mt-4 text-left">
                {METER_REASONS.map((r, i) => (
                  <motion.p key={i} className="font-body text-sm text-[#c9c1ea]"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>{r}</motion.p>
                ))}
              </div>
              <p className="font-hand text-2xl text-[#f5c451] mt-6 gold-glow">Bestest Mahila Mitra Forever 🤍</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
