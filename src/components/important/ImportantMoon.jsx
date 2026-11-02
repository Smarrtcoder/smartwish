import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, LockOpen } from "lucide-react";

const MOON_STARS = [
  { x: -16, y: -14, s: 3, d: 0 },
  { x: 108, y: 10, s: 2, d: 1.2 },
  { x: 100, y: 96, s: 2.5, d: 2.1 },
  { x: -18, y: 90, s: 2, d: 0.7 },
  { x: 44, y: -24, s: 2, d: 1.8 },
];

const NEON_RINGS = [
  { r: 46, dash: "120 169", color: "#f5c451", duration: 16, direction: 1 },
  { r: 50, dash: "44 270", color: "#93c5fd", duration: 24, direction: -1 },
  { r: 41, dash: "70 188", color: "#fde68a", duration: 11, direction: 1 },
];

const ORBIT_SPARKS = [0, 1, 2, 3, 4, 5];

const BURST_SPARKS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  return { id: i, x: Math.cos(angle) * 62, y: Math.sin(angle) * 62, size: 3 + (i % 2) * 2 };
});

const CLOUD_PATH =
  "M60 100 C30 100 12 80 24 62 C6 50 20 26 44 32 C50 10 90 6 104 30 C116 12 156 12 162 36 C182 28 204 44 196 66 C230 68 232 100 200 100 Z";

const MOON_GLOW_SOFT = "0 0 18px 2px rgba(245,196,81,0.35), 0 0 46px 8px rgba(147,197,253,0.18)";
const MOON_GLOW_STRONG = "0 0 30px 6px rgba(245,196,81,0.6), 0 0 70px 14px rgba(147,197,253,0.3)";
const UNLOCKED_GLOW_SOFT = "0 0 22px 4px rgba(255,226,140,0.5), 0 0 56px 12px rgba(245,196,81,0.28)";
const UNLOCKED_GLOW_STRONG = "0 0 40px 10px rgba(255,236,170,0.85), 0 0 90px 24px rgba(245,196,81,0.45)";
const CLOUD_GLOW_SOFT = "drop-shadow(0 0 10px rgba(245,196,81,0.4))";
const CLOUD_GLOW_STRONG = "drop-shadow(0 0 22px rgba(245,196,81,0.75))";

function NeonRings() {
  return (
    <div className="absolute -inset-[22px] pointer-events-none" aria-hidden="true">
      {NEON_RINGS.map((ring) => (
        <motion.svg key={ring.r} viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible"
          style={{ filter: `drop-shadow(0 0 3px ${ring.color}) drop-shadow(0 0 8px ${ring.color})` }}
          animate={{ rotate: ring.direction * 360 }}
          transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}>
          <circle cx="50" cy="50" r={ring.r} fill="none" stroke={ring.color} strokeWidth="1.2"
            strokeLinecap="round" strokeDasharray={ring.dash} opacity="0.9" />
        </motion.svg>
      ))}
    </div>
  );
}

function OrbitSparkles() {
  return (
    <motion.div className="absolute inset-0 pointer-events-none" aria-hidden="true"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.3 }}>
      {ORBIT_SPARKS.map((i) => (
        <motion.div key={i} className="absolute -inset-[14px]"
          initial={{ rotate: i * 60 }} animate={{ rotate: i * 60 + 360 }}
          transition={{ duration: 9 + (i % 3) * 2.5, repeat: Infinity, ease: "linear" }}>
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#fff3d6]"
            style={{ boxShadow: "0 0 6px #f5c451, 0 0 12px #f5c451" }} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function UnlockSparkBurst() {
  return (
    <div className="absolute left-1/2 top-1/2 pointer-events-none" aria-hidden="true">
      <motion.span className="absolute rounded-full"
        style={{ width: 120, height: 120, left: -60, top: -60, background: "radial-gradient(circle, rgba(255,240,190,0.95), rgba(245,196,81,0.4) 45%, transparent 70%)" }}
        initial={{ scale: 0.2, opacity: 0.9 }} animate={{ scale: 2.4, opacity: 0 }} transition={{ duration: 1.8, ease: "easeOut" }} />
      {BURST_SPARKS.map((p) => (
        <motion.span key={p.id} className="absolute rounded-full bg-[#fff3d6]"
          style={{ width: p.size, height: p.size, left: -p.size / 2, top: -p.size / 2, boxShadow: "0 0 8px #f5c451" }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0, 1.2, 0.4] }}
          transition={{ duration: 1.4, ease: "easeOut" }} />
      ))}
    </div>
  );
}

function MoonOrb({ unlocked }) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!unlocked) return undefined;
    const id = setTimeout(() => setOpened(true), 1400);
    return () => clearTimeout(id);
  }, [unlocked]);

  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20">
      <motion.span className="absolute -inset-4 rounded-full blur-md pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,196,81,0.28), rgba(147,197,253,0.14) 55%, transparent 72%)" }}
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />

      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle at 34% 30%, #fffbeb 0%, #f7e7b4 38%, #d8b765 74%, #9b7533 100%)" }}
        animate={{ boxShadow: opened ? [UNLOCKED_GLOW_SOFT, UNLOCKED_GLOW_STRONG, UNLOCKED_GLOW_SOFT] : [MOON_GLOW_SOFT, MOON_GLOW_STRONG, MOON_GLOW_SOFT] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="absolute left-[22%] top-[28%] w-[18%] h-[18%] rounded-full bg-[#9b7533]/20" />
        <span className="absolute left-[56%] top-[54%] w-[24%] h-[24%] rounded-full bg-[#9b7533]/15" />
        <span className="absolute left-[30%] top-[62%] w-[12%] h-[12%] rounded-full bg-[#9b7533]/20" />
      </motion.div>

      <NeonRings />
      {opened && <OrbitSparkles />}
      {opened && <UnlockSparkBurst />}

      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {opened ? (
            <motion.div
              key="open"
              className="rounded-full p-2 bg-[#5b3f12]/25 ring-1 ring-[#5b3f12]/50"
              initial={{ scale: 0.2, opacity: 0, rotate: -40 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <LockOpen size={22} color="#4a300c" strokeWidth={2.2} />
            </motion.div>
          ) : (
            <motion.div
              key="lock"
              className="rounded-full p-2 bg-[#1e1640]/70 ring-1 ring-[#f5c451]/60"
              animate={{ rotate: unlocked ? [0, -12, 12, -8, 8, 0] : 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              exit={{ scale: 0.2, opacity: 0, rotate: 40, transition: { duration: 0.7, ease: "easeIn" } }}
            >
              <Lock size={22} color="#fff3d6" strokeWidth={2.2} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {MOON_STARS.map((st, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, boxShadow: "0 0 6px rgba(255,255,255,0.9)" }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 3, delay: st.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function CloudBubble() {
  return (
    <motion.div
      className="relative w-44 sm:w-52"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="relative"
        animate={{ filter: [CLOUD_GLOW_SOFT, CLOUD_GLOW_STRONG, CLOUD_GLOW_SOFT] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 240 110" className="w-full h-auto" aria-hidden="true">
          <defs>
            <linearGradient id="importantCloudFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffdf5" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#f1e2ff" stopOpacity="0.88" />
            </linearGradient>
          </defs>
          <path d={CLOUD_PATH} fill="url(#importantCloudFill)" stroke="rgba(255,240,200,0.9)" strokeWidth="1.5" />
        </svg>
        <motion.span
          className="absolute inset-0 flex items-center justify-center pb-1 font-serif-display text-xs sm:text-sm font-semibold whitespace-nowrap text-[#2b1d4d]"
          animate={{ textShadow: ["0 0 0px rgba(245,196,81,0)", "0 0 10px rgba(245,196,81,0.75)", "0 0 0px rgba(245,196,81,0)"] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          Open This At Last ☁️
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

export default function ImportantMoon({ unlocked }) {
  return (
    <div className="flex flex-col items-start gap-6 sm:gap-7">
      <CloudBubble />
      <MoonOrb unlocked={unlocked} />
    </div>
  );
}
