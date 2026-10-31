import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const SPARK_COLORS = ["#f5c451", "#ffffff", "#f9a8d4", "#c4b5fd"];

const BURST_PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  const distance = 130 + (i % 3) * 60;
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    delay: (i % 4) * 0.06,
    size: 3 + (i % 3) * 1.5,
    color: SPARK_COLORS[i % SPARK_COLORS.length],
  };
});

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function splitRemaining(ms) {
  const total = Math.floor(ms / 1000);
  return [
    { label: "Days", value: Math.floor(total / 86400) },
    { label: "Hours", value: Math.floor((total % 86400) / 3600) },
    { label: "Minutes", value: Math.floor((total % 3600) / 60) },
    { label: "Seconds", value: total % 60 },
  ];
}

function StarField() {
  const stars = useRef(
    Array.from({ length: 70 }).map((_, i) => ({ id: i, x: rand(0, 100), y: rand(0, 100), s: rand(1, 3), dur: rand(2, 5), delay: rand(0, 4) }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <motion.span key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, boxShadow: "0 0 6px rgba(255,255,255,0.7)" }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}
      <motion.div className="absolute -top-32 -left-24 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)" }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-1/3 -right-40 w-[460px] h-[460px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.3), transparent 70%)" }}
        animate={{ x: [0, -40, 0], y: [0, 50, 0] }} transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

function CloudCard({ children }) {
  const dust = useRef(
    Array.from({ length: 12 }).map((_, i) => ({ id: i, x: rand(6, 94), y: rand(6, 94), dur: rand(3, 6), delay: i * 0.35, color: SPARK_COLORS[i % SPARK_COLORS.length] }))
  ).current;

  return (
    <div className="relative w-full">
      <motion.div className="absolute -inset-10 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,196,81,0.28), rgba(147,197,253,0.14) 45%, transparent 70%)" }}
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.97, 1.03, 0.97] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="relative w-full px-8 py-12 sm:px-14 sm:py-16 overflow-hidden"
        style={{
          borderRadius: "46% 54% 48% 52% / 52% 44% 56% 48%",
          background: "linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 60%, rgba(245,196,81,0.06))",
          backdropFilter: "blur(18px) saturate(130%)",
          WebkitBackdropFilter: "blur(18px) saturate(130%)",
          border: "1px solid rgba(255,240,200,0.28)",
          boxShadow: "0 0 60px rgba(245,196,81,0.22), 0 0 120px rgba(147,197,253,0.14), inset 0 1px 1px rgba(255,255,255,0.25)",
        }}
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}>
        {dust.map((d) => (
          <motion.span key={d.id} className="absolute rounded-full pointer-events-none"
            style={{ left: `${d.x}%`, top: `${d.y}%`, width: 3, height: 3, background: d.color, boxShadow: `0 0 8px ${d.color}` }}
            animate={{ opacity: [0, 0.9, 0], y: [0, -20, 0] }}
            transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }} />
        ))}
        <motion.span className="absolute left-6 top-6 text-[#fff3d6] pointer-events-none" aria-hidden="true"
          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>✦</motion.span>
        <motion.span className="absolute right-8 bottom-7 text-[#f9a8d4] pointer-events-none" aria-hidden="true"
          animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}>✧</motion.span>
        <div className="relative">{children}</div>
      </motion.div>
    </div>
  );
}

function LockedView({ remainingMs }) {
  return (
    <motion.div className="flex w-full max-w-2xl flex-col items-center text-center gap-10 sm:gap-12"
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.6 } }}>
      <CloudCard>
        <p className="font-serif-display text-2xl sm:text-4xl font-semibold text-[#fff3d6] leading-[1.2]"
          style={{ textShadow: "0 0 24px rgba(245,196,81,0.45)" }}>
          This is the Important Section.
        </p>
        <p className="font-body text-base sm:text-lg text-[#e6dcff] leading-[1.5] mt-6 max-w-lg mx-auto">
          And Arshia, I request you to please check out this section only after your birthday.
        </p>
      </CloudCard>

      <div className="flex flex-col items-center gap-5">
        <motion.p className="font-hand text-2xl sm:text-3xl text-[#f5c451] gold-glow"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1.2 }}>
          Something is waiting for you...
        </motion.p>
        <Countdown remainingMs={remainingMs} />
        <p className="font-body text-sm sm:text-base text-[#c9c1ea] leading-[1.5] max-w-md">
          A little patience makes some moments more special. ✨
        </p>
      </div>
    </motion.div>
  );
}

function Countdown({ remainingMs }) {
  const units = splitRemaining(remainingMs);
  return (
    <div role="timer" aria-label="Time until the important section unlocks" className="flex items-stretch justify-center gap-2 sm:gap-4">
      {units.map((u) => (
        <div key={u.label}
          className="glass flex flex-col items-center justify-center rounded-2xl w-[72px] sm:w-[100px] py-4 sm:py-5"
          style={{ borderColor: "rgba(245,196,81,0.35)", boxShadow: "0 18px 40px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.12), 0 0 28px rgba(245,196,81,0.15)" }}>
          <span className="relative font-serif-display text-3xl sm:text-5xl font-semibold text-[#fff3d6] leading-none"
            style={{ textShadow: "0 0 18px rgba(245,196,81,0.55)" }}>
            <FlipNumber value={u.value} />
          </span>
          <span className="font-body text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#e8c96b] mt-2">{u.label}</span>
        </div>
      ))}
    </div>
  );
}

function FlipNumber({ value }) {
  const text = String(value).padStart(2, "0");
  return (
    <span className="relative inline-flex h-[1em] overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} className="inline-block"
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function UnlockBurst() {
  return (
    <div className="absolute left-1/2 top-1/2 pointer-events-none -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
      <motion.span className="absolute rounded-full"
        style={{ width: 160, height: 160, left: -80, top: -80, background: "radial-gradient(circle, rgba(255,240,190,0.9), rgba(245,196,81,0.35) 45%, transparent 70%)" }}
        initial={{ scale: 0.2, opacity: 0.9 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 2.2, ease: "easeOut" }} />
      {BURST_PARTICLES.map((p) => (
        <motion.span key={p.id} className="absolute rounded-full"
          style={{ width: p.size, height: p.size, left: -p.size / 2, top: -p.size / 2, background: p.color, boxShadow: `0 0 10px ${p.color}` }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0, 1.3, 0.4] }}
          transition={{ duration: 2, delay: p.delay, ease: "easeOut" }} />
      ))}
    </div>
  );
}

function UnlockedView() {
  return (
    <motion.div className="relative flex w-full max-w-2xl flex-col items-center text-center gap-8 sm:gap-10"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}>
      <UnlockBurst />
      <motion.h2 className="font-serif-display text-4xl sm:text-6xl font-bold grad-gold leading-[1.2]"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}>
        The Important Section
      </motion.h2>
      <CloudCard>
        <p className="font-body text-base sm:text-lg text-[#e6dcff] leading-[1.5] max-w-lg mx-auto">
          Arshia, this section is finally open for you. Thank you for your patience.
        </p>
      </CloudCard>
    </motion.div>
  );
}

export default function ImportantPage({ unlocked, remainingMs, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div className="fixed inset-0 z-[70] cosmic-bg overflow-hidden"
      role="dialog" aria-modal="true" aria-label="Important section"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}>
      <StarField />
      <button type="button" onClick={onClose} aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 glass rounded-full p-3 text-[#f3f0ff] cursor-pointer transition-transform duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c451]/70">
        <X size={20} />
      </button>
      <div data-lenis-prevent className="relative z-[1] h-full overflow-y-auto flex items-center justify-center px-5 py-24 sm:px-8">
        <AnimatePresence mode="wait" initial={false}>
          {unlocked ? (
            <UnlockedView key="unlocked" />
          ) : (
            <LockedView key="locked" remainingMs={remainingMs} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
