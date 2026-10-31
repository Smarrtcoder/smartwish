import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { useIstUnlockClock } from "@/hooks/useIstUnlockClock";
import ImportantPage from "@/components/important/ImportantPage";
import ImportantPasswordPage from "@/components/important/ImportantPasswordPage";
import ImportantPersonalPage from "@/components/important/ImportantPersonalPage";

const MOON_STARS = [
  { x: -16, y: -14, s: 3, d: 0 },
  { x: 108, y: 10, s: 2, d: 1.2 },
  { x: 100, y: 96, s: 2.5, d: 2.1 },
  { x: -18, y: 90, s: 2, d: 0.7 },
  { x: 44, y: -24, s: 2, d: 1.8 },
];

const CLOUD_PATH =
  "M60 100 C30 100 12 80 24 62 C6 50 20 26 44 32 C50 10 90 6 104 30 C116 12 156 12 162 36 C182 28 204 44 196 66 C230 68 232 100 200 100 Z";

const MOON_GLOW_SOFT = "0 0 18px 2px rgba(245,196,81,0.35), 0 0 46px 8px rgba(147,197,253,0.18)";
const MOON_GLOW_STRONG = "0 0 30px 6px rgba(245,196,81,0.6), 0 0 70px 14px rgba(147,197,253,0.3)";
const CLOUD_GLOW_SOFT = "drop-shadow(0 0 10px rgba(245,196,81,0.4))";
const CLOUD_GLOW_STRONG = "drop-shadow(0 0 22px rgba(245,196,81,0.75))";

function MoonOrb({ unlocked, celebrate }) {
  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle at 34% 30%, #fffbeb 0%, #f7e7b4 38%, #d8b765 74%, #9b7533 100%)" }}
        animate={{ boxShadow: [MOON_GLOW_SOFT, MOON_GLOW_STRONG, MOON_GLOW_SOFT] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="absolute left-[22%] top-[28%] w-[18%] h-[18%] rounded-full bg-[#9b7533]/20" />
        <span className="absolute left-[56%] top-[54%] w-[24%] h-[24%] rounded-full bg-[#9b7533]/15" />
        <span className="absolute left-[30%] top-[62%] w-[12%] h-[12%] rounded-full bg-[#9b7533]/20" />
      </motion.div>

      {celebrate && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-[#f5c451] pointer-events-none"
          initial={{ scale: 1, opacity: 0.9 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {unlocked ? (
            <motion.div
              key="sparkle"
              className="rounded-full p-2"
              initial={{ scale: 0.2, opacity: 0, rotate: -60 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <Sparkles size={24} color="#5b3f12" strokeWidth={2.2} />
            </motion.div>
          ) : (
            <motion.div
              key="lock"
              className="rounded-full p-2 bg-[#1e1640]/70 ring-1 ring-[#f5c451]/60"
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
      className="relative w-40 sm:w-52"
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
        <span className="absolute inset-0 flex items-center justify-center pb-1 font-serif-display text-base sm:text-lg font-semibold text-[#2b1d4d]">
          Important ✨
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function ImportantSecret() {
  const { remainingMs, unlocked } = useIstUnlockClock();
  const [stage, setStage] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const wasUnlocked = useRef(unlocked);

  useEffect(() => {
    if (unlocked && !wasUnlocked.current) setCelebrate(true);
    wasUnlocked.current = unlocked;
  }, [unlocked]);

  const close = useCallback(() => setStage(null), []);
  const openCountdown = useCallback(() => setStage("countdown"), []);
  const openPassword = useCallback(() => setStage("password"), []);
  const openPersonal = useCallback(() => setStage("personal"), []);

  return (
    <>
      <motion.button
        type="button"
        onClick={openCountdown}
        aria-label={unlocked ? "Open the important section" : "Open the locked important section"}
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[50] flex items-center gap-2 sm:gap-3 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c451]/70"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
      >
        <MoonOrb unlocked={unlocked} celebrate={celebrate} />
        <CloudBubble />
      </motion.button>

      <AnimatePresence mode="wait">
        {stage === "countdown" && (
          <ImportantPage key="countdown" unlocked={unlocked} remainingMs={remainingMs} onEnter={openPassword} onClose={close} />
        )}
        {stage === "password" && <ImportantPasswordPage key="password" onUnlock={openPersonal} onClose={close} />}
        {stage === "personal" && <ImportantPersonalPage key="personal" onClose={close} />}
      </AnimatePresence>
    </>
  );
}
