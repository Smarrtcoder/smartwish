import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LETTERS, SECRET_LETTER } from "../../data";
import { Typewriter, ParticleBurst } from "../Ambience";
import { Header } from "./Story";
import LetterUniverse from "./LetterUniverse";

const PLANET_COLORS = ["#f9a8d4", "#c4b5fd", "#fcd6a4", "#a4d4fc", "#fcb4c4"];
const SPARK_COLORS = ["#f5c451", "#ffffff", "#f9a8d4", "#c4b5fd"];

function sRand(min, max) {
  return Math.random() * (max - min) + min;
}

/* ---- Faster premium typewriter with synchronized sparkles (rAF-driven for smoothness) ---- */
function SecretTypewriter({ text }) {
  const [shown, setShown] = useState("");
  const [typing, setTyping] = useState(false);
  const cursorRef = useRef(null);
  const wrapRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const pid = useRef(0);
  const rafRef = useRef(null);

  const emitSparkle = () => {
    const wrap = wrapRef.current;
    const cur = cursorRef.current;
    if (!wrap || !cur) return;
    const wr = wrap.getBoundingClientRect();
    const cr = cur.getBoundingClientRect();
    const x = cr.left - wr.left + cr.width / 2;
    const y = cr.top - wr.top + cr.height / 2;
    const id = pid.current++;
    const color = SPARK_COLORS[id % SPARK_COLORS.length];
    const drift = (Math.random() - 0.5) * 24;
    const rise = 26 + Math.random() * 42;
    const life = 0.9 + Math.random() * 0.6;
    const size = 2 + Math.random() * 2.2;
    setParticles((p) => [...p.slice(-20), { id, x, y, color, drift, rise, life, size }]);
    setTimeout(() => setParticles((p) => p.filter((pt) => pt.id !== id)), life * 1000 + 80);
  };

  useEffect(() => {
    setShown("");
    setParticles([]);
    setTyping(true);
    let i = 0;
    const step = Math.max(1, Math.round(text.length / 250));
    let lastTime = performance.now();
    const interval = 5;

    const tick = (now) => {
      if (now - lastTime >= interval) {
        lastTime = now;
        i += step;
        setShown(text.slice(0, i));
        if (i < text.length) emitSparkle();
        if (i >= text.length) {
          setTyping(false);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <span
        className="font-serif-display italic text-lg md:text-xl lg:text-2xl text-[#f5edd6] leading-relaxed whitespace-pre-line tracking-wide"
        style={{ textShadow: "0 0 18px rgba(245,196,81,0.45), 0 2px 8px rgba(0,0,0,0.65), 0 0 40px rgba(139,92,246,0.22)" }}
      >
        {shown}
        <motion.span
          ref={cursorRef}
          className="inline-block w-[2px] h-[1.1em] align-middle ml-0.5 rounded-full"
          style={{ background: "#f5c451", boxShadow: "0 0 8px #f5c451, 0 0 16px rgba(245,196,81,0.65), 0 0 24px rgba(245,196,81,0.3)" }}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.45, 0.5, 1], ease: "linear" }}
        />
      </span>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: typing ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full"
            style={{ left: p.x, top: p.y, width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2, background: p.color, boxShadow: `0 0 6px ${p.color}, 0 0 3px ${p.color}` }}
            initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.3, 1.4, 0.2], x: p.drift, y: -p.rise }}
            transition={{ duration: p.life, ease: "easeOut" }}
          />
        ))}
      </motion.div>
    </div>
  );
}

/* ---- Magical full-screen universe for the Secret Letter ---- */
function SecretUniverse({ onClose }) {
  const stars = useRef(
    Array.from({ length: 120 }).map((_, i) => ({ id: i, x: sRand(0, 100), y: sRand(0, 100), s: sRand(1, 3), delay: sRand(0, 4), dur: sRand(2, 5) }))
  ).current;

  const planets = useRef(
    Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: [12, 28, 64, 80, 90][i],
      y: [22, 70, 30, 80, 14][i],
      size: sRand(20, 38),
      color: PLANET_COLORS[i % PLANET_COLORS.length],
      delay: sRand(0, 2),
      dur: sRand(10, 18),
      drift: sRand(-30, 30),
      ring: i % 2 === 0,
    }))
  ).current;

  const clouds = useRef(
    Array.from({ length: 4 }).map((_, i) => ({ id: i, y: [18, 52, 76, 40][i], x: sRand(-10, 90), w: sRand(220, 360), dur: sRand(40, 70), delay: sRand(0, 10), op: sRand(0.05, 0.12) }))
  ).current;

  return (
    <motion.div
      className="fixed inset-0 z-[90] overflow-hidden"
      initial={{ opacity: 0, scale: 1.3 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.15 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* deep galaxy gradient */}
      <div className="absolute inset-0" style={{
        background:
          "radial-gradient(70% 60% at 30% 25%, rgba(139,92,246,0.42), transparent 60%), radial-gradient(60% 55% at 80% 30%, rgba(236,72,153,0.35), transparent 62%), radial-gradient(80% 70% at 50% 95%, rgba(109,40,217,0.5), transparent 60%), linear-gradient(160deg, #06061a 0%, #120a2e 50%, #08081f 100%)",
      }} />

      {/* nebula blobs */}
      <motion.div className="absolute -top-32 -left-24 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)" }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.4), transparent 70%)" }}
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }} transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }} />

      {/* stars */}
      {stars.map((s) => (
        <motion.span key={s.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, boxShadow: "0 0 6px rgba(255,255,255,0.8)" }}
          animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* cartoon moon */}
      <motion.div className="absolute top-[8%] right-[12%] pointer-events-none"
        animate={{ y: [0, -12, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full"
          style={{ background: "radial-gradient(circle at 35% 30%, #fffbe8, #f5e8b0 60%, #e8d488 100%)", boxShadow: "0 0 50px rgba(245,232,176,0.5), inset -14px -10px 30px rgba(180,150,80,0.5)" }}>
          <span className="absolute top-[22%] left-[28%] w-3 h-3 rounded-full" style={{ background: "rgba(180,150,80,0.35)" }} />
          <span className="absolute top-[52%] left-[58%] w-4 h-4 rounded-full" style={{ background: "rgba(180,150,80,0.3)" }} />
          <span className="absolute top-[68%] left-[32%] w-2.5 h-2.5 rounded-full" style={{ background: "rgba(180,150,80,0.3)" }} />
        </div>
      </motion.div>

      {/* planets */}
      {planets.map((p) => (
        <motion.div key={p.id} className="absolute pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -16, 0], x: [0, p.drift, 0], rotate: [0, 8, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}>
          <div className="relative" style={{ width: p.size, height: p.size }}>
            {p.ring && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ width: p.size * 1.8, height: p.size * 0.5, border: `1.5px solid ${p.color}66`, transform: "translate(-50%,-50%) rotate(-22deg)" }} />
            )}
            <div className="w-full h-full rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, ${p.color}, ${p.color}88 70%, ${p.color}44)`, boxShadow: `0 0 18px ${p.color}55, inset -4px -3px 8px rgba(0,0,0,0.3)` }} />
          </div>
        </motion.div>
      ))}

      {/* soft clouds */}
      {clouds.map((c) => (
        <motion.div key={c.id} className="absolute pointer-events-none rounded-full blur-2xl"
          style={{ top: `${c.y}%`, left: `${c.x}%`, width: c.w, height: c.w * 0.4, background: "rgba(196,181,253,0.5)", opacity: c.op }}
          animate={{ x: [0, 60, 0] }} transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* floating particles */}
      {Array.from({ length: 16 }).map((_, i) => {
        const color = SPARK_COLORS[i % SPARK_COLORS.length];
        return (
          <motion.span key={`mp${i}`} className="absolute rounded-full pointer-events-none"
            style={{ left: `${sRand(5, 95)}%`, top: `${sRand(5, 95)}%`, width: 3, height: 3, background: color, boxShadow: `0 0 8px ${color}` }}
            animate={{ opacity: [0, 1, 0], y: [0, -60], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: sRand(3, 5), delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }} />
        );
      })}

      {/* click-to-close hint */}
      <motion.div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none font-body text-sm text-[#c4b5fd] tracking-wide z-[100]"
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        tap anywhere to close
      </motion.div>
    </motion.div>
  );
}

/* ---- Elegant scroll-down indicator for SecretGlassWindow ---- */
function SecretScrollIndicator({ scrollRef }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf;
    const check = () => {
      raf = requestAnimationFrame(check);
      const hasMore = el.scrollHeight - el.scrollTop - el.clientHeight > 40;
      setVisible(hasMore);
    };
    check();
    return () => cancelAnimationFrame(raf);
  }, [scrollRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-[96]"
          initial={{ opacity: 0, y: 8, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(245,196,81,0.12)",
              border: "1px solid rgba(245,196,81,0.35)",
              boxShadow: "0 0 16px rgba(245,196,81,0.2)",
              backdropFilter: "blur(4px)",
            }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span
              className="text-[#f5c451] text-base"
              style={{ textShadow: "0 0 8px rgba(245,196,81,0.6)" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              ↓
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---- Crystal glass message window floating in the universe ---- */
function SecretGlassWindow({ text, onClose }) {
  const scrollRef = useRef(null);

  // Stop wheel/touch events from reaching Lenis (global smooth-scroll on window)
  // so the letter's native overflow scroll handles them instead.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const stop = (e) => e.stopPropagation();
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("touchmove", stop, { passive: true });
    return () => {
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchmove", stop);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-start justify-center pt-[8vh] pb-[4vh] px-4 md:px-6"
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl crystal-glass rounded-3xl relative flex flex-col"
        style={{ maxHeight: "84vh" }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        {/* title — fixed at top, never moves */}
        <motion.div
          className="text-center pt-6 pb-4 md:pt-8 md:pb-5 flex-shrink-0"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3"
            style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)", boxShadow: "0 0 30px rgba(236,72,153,0.5), 0 6px 20px rgba(0,0,0,0.3)" }}>💖</div>
          <h3 className="font-hand text-3xl md:text-4xl text-[#f5edd6]"
            style={{ textShadow: "0 0 20px rgba(245,196,81,0.5), 0 2px 10px rgba(0,0,0,0.5)" }}>A Little Secret</h3>
        </motion.div>

        {/* scrollable letter content area — grows downward, internal scroll only */}
        <div
          ref={scrollRef}
          className="overflow-y-auto px-6 pb-8 md:px-10 md:pb-10 flex justify-center"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "thin", overscrollBehavior: "contain" }}
        >
          <SecretTypewriter text={text} />
        </div>

        <SecretScrollIndicator scrollRef={scrollRef} />
      </motion.div>
    </motion.div>
  );
}

/* Storybook fairytale paper used by letters + secret letter */
function StorybookPaper({ children, title, emoji, color, wide = false }) {
  return (
    <div className={`relative rounded-[1.5rem] p-7 md:p-9 ${wide ? "max-w-2xl" : "max-w-lg"} w-full`}
      style={{ background: "radial-gradient(120% 120% at 50% 0%, #fffdf6 0%, #fdf3e6 55%, #f7e7d4 100%)", border: "1px solid #e8cfa6", boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(245,196,81,0.3)" }}>
      {/* floral border corners */}
      <div className="pointer-events-none absolute inset-2 rounded-[1.2rem]" style={{ border: "1.5px dashed rgba(199,142,90,0.5)" }} />
      <span className="absolute -top-3 -left-2 text-2xl">🌸</span>
      <span className="absolute -top-3 -right-2 text-2xl">🌷</span>
      <span className="absolute -bottom-3 -left-2 text-2xl">🌿</span>
      <span className="absolute -bottom-3 -right-2 text-2xl">🌼</span>
      {/* ribbon */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-body tracking-widest"
        style={{ background: "linear-gradient(120deg,#ec4899,#8b5cf6)", boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }}>💌 LETTER</div>
      {title && (
        <div className="text-center mb-3 mt-2">
          {emoji && <div className="mx-auto w-11 h-11 rounded-full flex items-center justify-center text-xl mb-2" style={{ background: `linear-gradient(135deg,${color || "#f9a8d4"},#fff)` }}>{emoji}</div>}
          <h3 className="font-serif-display text-2xl font-bold text-[#5a3a1e]">{title}</h3>
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function LuxEnvelope({ letter }) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden glass"
      style={{ background: `linear-gradient(135deg, ${letter.color}33, rgba(28,20,58,0.55))` }}>
      <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 50% 120%, ${letter.color}66, transparent 60%)` }} />
      {/* body lines */}
      <div className="absolute inset-x-3 bottom-3 top-1/2" style={{ background: `linear-gradient(${letter.color}22, transparent)`, borderRadius: 10 }} />
      {/* flap */}
      <div className="absolute inset-x-0 top-0 h-1/2 z-10" style={{ clipPath: "polygon(0 0,100% 0,50% 100%)", background: `linear-gradient(${letter.color}77, ${letter.color}33)`, borderBottom: "1px solid rgba(245,196,81,0.4)" }} />
      {/* wax seal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-lg z-20"
        style={{ background: "radial-gradient(circle,#e07d8c,#8f3d4c)", boxShadow: "0 4px 14px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)" }}>{letter.emoji}</div>
      <span className="absolute top-2 left-3 text-xs">✨</span>
      <span className="absolute bottom-2 right-3 text-xs">🌸</span>
      <p className="absolute bottom-3 left-0 right-0 font-hand text-lg text-[#f5c451] px-2 gold-glow z-20 text-center">{letter.label}</p>
    </div>
  );
}

export default function Letters() {
  const [open, setOpen] = useState(null);
  const letter = LETTERS.find((l) => l.id === open);

  // Lock body scroll while a mood letter universe is open
  useEffect(() => {
    if (!letter) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [letter]);

  return (
    <section className="relative py-24 px-6" data-testid="letters-section">
      <Header emoji="💌" title="Letters For Every Mood" subtitle="No matter what you're feeling, there's always a little letter waiting for you. 🤍" />

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {LETTERS.map((l, i) => (
          <motion.button key={l.id} data-testid={`envelope-${l.id}`} onClick={() => setOpen(l.id)}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.06 }} whileHover={{ y: -10, scale: 1.04, boxShadow: "0 26px 55px rgba(236,72,153,0.4)" }}
            className="rounded-2xl">
            <LuxEnvelope letter={l} />
          </motion.button>
        ))}
      </div>

      <LetterUniverse letter={letter} onClose={() => setOpen(null)} />
    </section>
  );
}

export function SecretLetter() {
  const [revealed, setRevealed] = useState(false);

  // Lock body scroll while the Secret Letter universe is open
  useEffect(() => {
    if (!revealed) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [revealed]);

  return (
    <section className="relative py-24 px-6" data-testid="secret-section">
      <Header emoji="💖" title="Secret Letter" subtitle="Only open when you're ready... ❤️" />
      <div className="max-w-2xl mx-auto flex justify-center">
        {!revealed ? (
          <motion.button onClick={() => setRevealed(true)} data-testid="open-secret" className="relative"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} animate={{ y: [0, -10, 0] }} transition={{ y: { duration: 4, repeat: Infinity } }}>
            <div className="glass glass-gold rounded-3xl px-12 py-14 text-center relative">
              <div className="absolute -inset-3 rounded-[2rem] blur-2xl -z-10" style={{ background: "radial-gradient(circle,rgba(236,72,153,0.5),transparent 70%)" }} />
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3" style={{ background: "radial-gradient(circle,#e07d8c,#8f3d4c)" }}>💌</div>
              <p className="font-hand text-2xl text-[#f5c451] gold-glow">tap to unseal</p>
            </div>
          </motion.button>
        ) : null}
      </div>

      <AnimatePresence>
        {revealed && (
          <div className="fixed inset-0 z-[90]">
            <SecretUniverse onClose={() => setRevealed(false)} />
            <SecretGlassWindow text={SECRET_LETTER} onClose={() => setRevealed(false)} />
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
