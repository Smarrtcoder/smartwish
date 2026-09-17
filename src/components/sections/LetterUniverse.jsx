import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PLANET_COLORS = ["#f9a8d4", "#c4b5fd", "#fcd6a4", "#a4d4fc", "#fcb4c4"];
const SPARK_COLORS = ["#f5c451", "#ffffff", "#f9a8d4", "#c4b5fd"];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/* ---- Elegant scroll-down indicator ---- */
function ScrollIndicator({ scrollRef }) {
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

/* ---------------- Cinematic typewriter with synchronized magical sparkles ---------------- */
function UniverseTypewriter({ text }) {
  const [shown, setShown] = useState("");
  const [typing, setTyping] = useState(false);
  const cursorRef = useRef(null);
  const wrapRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [stars, setStars] = useState([]);
  const pid = useRef(0);
  const rafRef = useRef(null);

  const emitSparkle = useCallback(() => {
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
  }, []);

  const emitStar = useCallback(() => {
    const wrap = wrapRef.current;
    const cur = cursorRef.current;
    if (!wrap || !cur) return;
    const wr = wrap.getBoundingClientRect();
    const cr = cur.getBoundingClientRect();
    const x = cr.left - wr.left + (Math.random() - 0.5) * 90;
    const y = cr.top - wr.top + (Math.random() - 0.5) * 34;
    const id = pid.current++;
    const life = 0.8 + Math.random() * 0.5;
    setStars((s) => [...s.slice(-8), { id, x, y, life }]);
    setTimeout(() => setStars((s) => s.filter((st) => st.id !== id)), life * 1000 + 80);
  }, []);

  useEffect(() => {
    setShown("");
    setParticles([]);
    setStars([]);
    setTyping(true);

    let i = 0;
    const step = Math.max(1, Math.round(text.length / 350));
    let lastTime = performance.now();
    const interval = 8; // ms between steps

    const tick = (now) => {
      if (now - lastTime >= interval) {
        lastTime = now;
        i += step;
        setShown(text.slice(0, i));
        if (i < text.length) {
          emitSparkle();
          if (Math.random() < 0.22) emitStar();
        }
        if (i >= text.length) {
          setTyping(false);
          return; // stop the loop
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, emitSparkle, emitStar]);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <span
        className="font-hand text-xl md:text-2xl lg:text-[1.7rem] text-[#f5edd6] leading-relaxed whitespace-pre-line"
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

      {/* synchronized magical sparkles + glitter trail */}
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
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              background: p.color,
              boxShadow: `0 0 6px ${p.color}, 0 0 3px ${p.color}`,
            }}
            initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.3, 1.4, 0.2], x: p.drift, y: -p.rise }}
            transition={{ duration: p.life, ease: "easeOut" }}
          />
        ))}
        {stars.map((s) => (
          <motion.span
            key={s.id}
            className="absolute"
            style={{ left: s.x, top: s.y, marginLeft: -6, marginTop: -6, fontSize: 12, color: "#fff", textShadow: "0 0 8px #c4b5fd, 0 0 4px #fff" }}
            initial={{ opacity: 0, scale: 0.2, rotate: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.2, 1.3, 0.2], rotate: 90 }}
            transition={{ duration: s.life, ease: "easeInOut" }}
          >
            ✦
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------------- Immersive magical universe backdrop (unchanged) ---------------- */
function Universe({ onClose }) {
  const stars = useRef(
    Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      x: rand(0, 100),
      y: rand(0, 100),
      s: rand(1, 3),
      delay: rand(0, 4),
      dur: rand(2, 5),
      depth: rand(0.3, 1),
    }))
  ).current;

  const constellations = useRef(
    Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      cx: rand(10, 90),
      cy: rand(8, 75),
      pts: Array.from({ length: 4 + (i % 3) }).map(() => ({
        dx: rand(-50, 50),
        dy: rand(-40, 40),
      })),
    }))
  ).current;

  const planets = useRef(
    Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: [12, 28, 64, 80, 90][i],
      y: [22, 70, 30, 80, 14][i],
      size: rand(20, 38),
      color: PLANET_COLORS[i % PLANET_COLORS.length],
      delay: rand(0, 2),
      dur: rand(10, 18),
      drift: rand(-30, 30),
      ring: i % 2 === 0,
    }))
  ).current;

  const butterflies = useRef(
    Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      startX: rand(0, 100),
      startY: rand(20, 80),
      dur: rand(14, 24),
      delay: rand(0, 4),
      size: rand(18, 28),
    }))
  ).current;

  const clouds = useRef(
    Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      y: [18, 52, 76, 40][i],
      x: rand(-10, 90),
      w: rand(220, 360),
      dur: rand(40, 70),
      delay: rand(0, 10),
      op: rand(0.05, 0.12),
    }))
  ).current;

  const rays = useMemo(() => [0, 1, 2, 3].map((i) => ({ id: i, angle: i * 90 + rand(-10, 10) })), []);

  return (
    <motion.div
      className="fixed inset-0 z-[90] overflow-hidden"
      initial={{ opacity: 0, scale: 1.3 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.15 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClose}
    >
      {/* deep galaxy gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 30% 25%, rgba(139,92,246,0.42), transparent 60%), radial-gradient(60% 55% at 80% 30%, rgba(236,72,153,0.35), transparent 62%), radial-gradient(80% 70% at 50% 95%, rgba(109,40,217,0.5), transparent 60%), linear-gradient(160deg, #06061a 0%, #120a2e 50%, #08081f 100%)",
        }}
      />

      {/* nebula blobs */}
      <motion.div className="absolute -top-32 -left-24 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)" }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.4), transparent 70%)" }}
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }} transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }} />

      {/* stars with parallax depth */}
      {stars.map((s) => (
        <motion.span key={s.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, boxShadow: "0 0 6px rgba(255,255,255,0.8)" }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* constellations (faint connected stars) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        {constellations.map((c) => {
          const pts = c.pts.map((p) => `${c.cx + p.dx},${c.cy + p.dy}`).join(" ");
          return (
            <g key={c.id}>
              <polyline points={pts} fill="none" stroke="rgba(196,181,253,0.4)" strokeWidth="0.6" strokeDasharray="2 4" />
              {c.pts.map((p, j) => (
                <circle key={j} cx={c.cx + p.dx} cy={c.cy + p.dy} r="1.2" fill="#fff" opacity="0.7" />
              ))}
            </g>
          );
        })}
      </svg>

      {/* cartoon moon (top-right) */}
      <motion.div className="absolute top-[8%] right-[12%] pointer-events-none"
        animate={{ y: [0, -12, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full"
          style={{ background: "radial-gradient(circle at 35% 30%, #fffbe8, #f5e8b0 60%, #e8d488 100%)", boxShadow: "0 0 50px rgba(245,232,176,0.5), inset -14px -10px 30px rgba(180,150,80,0.5)" }}>
          <span className="absolute top-[22%] left-[28%] w-3 h-3 rounded-full" style={{ background: "rgba(180,150,80,0.35)" }} />
          <span className="absolute top-[52%] left-[58%] w-4 h-4 rounded-full" style={{ background: "rgba(180,150,80,0.3)" }} />
          <span className="absolute top-[68%] left-[32%] w-2.5 h-2.5 rounded-full" style={{ background: "rgba(180,150,80,0.3)" }} />
        </div>
      </motion.div>

      {/* floating planets with rings */}
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

      {/* floating butterflies */}
      {butterflies.map((b) => (
        <motion.span key={b.id} className="absolute pointer-events-none select-none"
          style={{ left: `${b.startX}%`, top: `${b.startY}%`, fontSize: b.size, filter: "drop-shadow(0 0 6px rgba(244,114,182,0.5))" }}
          animate={{ x: [0, 80, -40, 0], y: [0, -50, 30, 0], rotate: [0, 10, -8, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}>
          🦋
        </motion.span>
      ))}

      {/* soft clouds */}
      {clouds.map((c) => (
        <motion.div key={c.id} className="absolute pointer-events-none rounded-full blur-2xl"
          style={{ top: `${c.y}%`, left: `${c.x}%`, width: c.w, height: c.w * 0.4, background: "rgba(196,181,253,0.5)", opacity: c.op }}
          animate={{ x: [0, 60, 0] }} transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* light rays from moon */}
      {rays.map((r) => (
        <motion.div key={r.id} className="absolute top-[10%] right-[18%] origin-top pointer-events-none"
          style={{ width: 2, height: "60%", background: "linear-gradient(rgba(245,232,176,0.18), transparent)", transform: `rotate(${r.angle}deg)` }}
          animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 6, delay: r.id * 0.8, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* magical particles */}
      {Array.from({ length: 14 }).map((_, i) => {
        const color = SPARK_COLORS[i % SPARK_COLORS.length];
        return (
          <motion.span key={`mp${i}`} className="absolute rounded-full pointer-events-none"
            style={{ left: `${rand(5, 95)}%`, top: `${rand(5, 95)}%`, width: 3, height: 3, background: color, boxShadow: `0 0 8px ${color}` }}
            animate={{ opacity: [0, 1, 0], y: [0, -60], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: rand(3, 5), delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }} />
        );
      })}

      {/* click-to-close hint */}
      <motion.div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none font-body text-sm text-[#c4b5fd] tracking-wide"
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        tap anywhere to close
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Floating letter text — no card, blends with universe ---------------- */
function FloatingLetter({ letter, onClose }) {
  const scrollRef = useRef(null);

  // Stop wheel/touch from reaching Lenis (global smooth-scroll on window)
  // but do NOT stop click — let clicks bubble up to Universe onClick={onClose}
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
      className="fixed inset-0 z-[95] flex items-start justify-center pt-[8vh] pb-[4vh] px-4 md:px-6 pointer-events-none"
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative max-w-2xl w-full flex flex-col items-center pointer-events-auto"
        style={{ maxHeight: "84vh" }}
      >
        {/* emoji + title — fixed at top, never moves */}
        <motion.div
          className="mb-6 flex-shrink-0 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)", boxShadow: "0 0 30px rgba(139,92,246,0.5), 0 6px 20px rgba(0,0,0,0.3)" }}>
            {letter.emoji}
          </div>
          <h3 className="font-hand text-3xl md:text-4xl text-[#f5edd6]"
            style={{ textShadow: "0 0 20px rgba(245,196,81,0.5), 0 2px 10px rgba(0,0,0,0.5)" }}>
            {letter.title}
          </h3>
        </motion.div>

        {/* scrollable letter content — grows downward, internal scroll only */}
        <div
          ref={scrollRef}
          className="overflow-y-auto flex justify-center w-full"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "thin", overscrollBehavior: "contain" }}
        >
          <UniverseTypewriter text={letter.body} />
        </div>

        <ScrollIndicator scrollRef={scrollRef} />
      </motion.div>
    </motion.div>
  );
}

export default function LetterUniverse({ letter, onClose }) {
  return (
    <AnimatePresence>
      {letter && (
        <div className="fixed inset-0 z-[90]">
          <Universe onClose={onClose} />
          <FloatingLetter letter={letter} onClose={onClose} />
        </div>
      )}
    </AnimatePresence>
  );
}
