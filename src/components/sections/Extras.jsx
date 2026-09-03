import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Confetti from "react-confetti";
import { Sparkles } from "lucide-react";
import { COMPLIMENTS, METER_REASONS } from "../../data";
import { Typewriter } from "../Ambience";
import { Header } from "./Story";

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
        <motion.div className="glass rounded-3xl p-8 w-full min-h-[200px] flex items-center justify-center text-center"
          animate={{ rotateY: flip ? 90 : 0 }} transition={{ duration: 0.35 }}>
          <p className="font-body text-lg text-white whitespace-pre-line leading-relaxed">
            <Typewriter key={idx} text={COMPLIMENTS[idx]} speed={8} />
          </p>
        </motion.div>
        <motion.button data-testid="compliment-button" onClick={next}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          className="mt-6 px-8 py-3 rounded-full font-body font-semibold text-white flex items-center gap-2"
          style={{ background: "linear-gradient(120deg,#8b5cf6,#ec4899)", boxShadow: "0 10px 30px rgba(139,92,246,0.5)" }}>
          <Sparkles size={18} /> Another one
        </motion.button>
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
