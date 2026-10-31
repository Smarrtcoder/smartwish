import { AnimatePresence, motion } from "framer-motion";
import Countdown from "@/components/important/ImportantCountdown";
import { CloudCard, GoldButton, ImportantShell, SPARK_COLORS, StarField } from "@/components/important/ImportantShared";

function CosmicGlows() {
  return (
    <>
      <motion.div className="absolute -top-32 -left-24 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)" }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-1/3 -right-40 w-[460px] h-[460px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.3), transparent 70%)" }}
        animate={{ x: [0, -40, 0], y: [0, 50, 0] }} transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }} />
    </>
  );
}

function LightWaves() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="absolute rounded-full border border-[#f5c451]/40"
          style={{ width: 280, height: 280 }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.8], opacity: [0.7, 0] }}
          transition={{ duration: 4, delay: i * 1.3, repeat: Infinity, ease: "easeOut" }} />
      ))}
    </div>
  );
}

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

function CountdownPanel({ unlocked, remainingMs, onEnter }) {
  return (
    <div className="relative flex w-full max-w-2xl flex-col items-center text-center gap-8 sm:gap-10">
      <AnimatePresence initial={false}>
        {!unlocked && (
          <motion.div key="cloud" className="w-full"
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.6 } }}>
            <CloudCard>
              <p className="font-serif-display text-2xl sm:text-4xl font-semibold text-[#fff3d6] leading-[1.2]"
                style={{ textShadow: "0 0 24px rgba(245,196,81,0.45)" }}>
                This is the Important Section.
              </p>
              <p className="font-body text-base sm:text-lg text-[#e6dcff] leading-[1.5] mt-6 max-w-lg mx-auto">
                And Arshia, I request you to please check out this section only after your birthday.
              </p>
            </CloudCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-center gap-5 sm:gap-6">
        <AnimatePresence>
          {unlocked && (
            <motion.div key="effects" className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LightWaves />
              <UnlockBurst />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {unlocked ? (
            <motion.h2 key="done-heading"
              className="relative font-serif-display text-3xl sm:text-5xl font-bold grad-gold leading-[1.2]"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}>
              The Moment Has Finally Arrived ✨
            </motion.h2>
          ) : (
            <motion.p key="wait-heading"
              className="relative font-hand text-2xl sm:text-3xl text-[#f5c451] gold-glow"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}>
              Something is waiting for you...
            </motion.p>
          )}
        </AnimatePresence>

        <Countdown remainingMs={remainingMs} />

        <AnimatePresence mode="wait" initial={false}>
          {unlocked ? (
            <motion.p key="done-line"
              className="relative font-body text-base sm:text-lg text-[#e6dcff] leading-[1.5]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.8, duration: 1 }}>
              Some things are worth waiting for...
            </motion.p>
          ) : (
            <motion.p key="wait-line"
              className="relative font-body text-sm sm:text-base text-[#c9c1ea] leading-[1.5] max-w-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              A little patience makes some moments more special. ✨
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {unlocked && (
            <motion.div key="enter" className="relative pt-2"
              initial={{ opacity: 0, y: 24, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }} transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}>
              <GoldButton onClick={onEnter}>Enter The Section →</GoldButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ImportantPage({ unlocked, remainingMs, onEnter, onClose }) {
  return (
    <ImportantShell label="Important section" onClose={onClose}
      backdrop={<><StarField /><CosmicGlows /></>}>
      <div className="flex min-h-full items-center justify-center px-5 py-24 sm:px-8">
        <CountdownPanel unlocked={unlocked} remainingMs={remainingMs} onEnter={onEnter} />
      </div>
    </ImportantShell>
  );
}
