import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export const SPARK_COLORS = ["#f5c451", "#ffffff", "#f9a8d4", "#c4b5fd"];

export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function StarField({ count = 70 }) {
  const stars = useRef(
    Array.from({ length: count }).map((_, i) => ({ id: i, x: rand(0, 100), y: rand(0, 100), s: rand(1, 3), dur: rand(2, 5), delay: rand(0, 4) }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <motion.span key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, boxShadow: "0 0 6px rgba(255,255,255,0.7)" }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

export function ImportantShell({ label, onClose, backdrop, scrollRef, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div className="fixed inset-0 z-[70] cosmic-bg overflow-hidden"
      role="dialog" aria-modal="true" aria-label={label}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}>
      {backdrop}
      <button type="button" onClick={onClose} aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 glass rounded-full p-3 text-[#f3f0ff] cursor-pointer transition-transform duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c451]/70">
        <X size={20} />
      </button>
      <div ref={scrollRef} data-lenis-prevent className="relative z-[1] h-full overflow-y-auto">
        {children}
      </div>
    </motion.div>
  );
}

export function CloudCard({ children }) {
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

export function GoldButton({ children, className = "", disabled, ...props }) {
  return (
    <motion.div className={`relative inline-block ${className}`}
      animate={{ y: [0, -4, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
      <motion.span aria-hidden="true" className="absolute -inset-[3px] rounded-[1.1rem] blur-[6px] pointer-events-none"
        style={{ background: "linear-gradient(120deg,#fff3d6,#f5c451,#f9a8d4,#f5c451,#fff3d6)" }}
        animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.button type="button" {...props} disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.04 }}
        whileTap={disabled ? undefined : { y: 5, scale: 0.97 }}
        className="relative w-full cursor-pointer rounded-2xl px-8 py-4 font-body text-base sm:text-lg font-semibold tracking-wide text-[#2b1d4d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fff3d6] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg,#fff6e0 0%,#f5c451 46%,#e0a14a 100%)",
          boxShadow: "0 9px 0 #8f5f1d, 0 18px 40px rgba(245,196,81,0.4), inset 0 2px 1px rgba(255,255,255,0.75), inset 0 -2px 3px rgba(143,95,29,0.45)",
          border: "1px solid rgba(255,246,224,0.95)",
        }}>
        {children}
      </motion.button>
    </motion.div>
  );
}
