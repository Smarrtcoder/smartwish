import { AnimatePresence, motion } from "framer-motion";

function splitRemaining(ms) {
  const total = Math.floor(ms / 1000);
  return [
    { label: "Days", value: Math.floor(total / 86400) },
    { label: "Hours", value: Math.floor((total % 86400) / 3600) },
    { label: "Minutes", value: Math.floor((total % 3600) / 60) },
    { label: "Seconds", value: total % 60 },
  ];
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

export default function Countdown({ remainingMs }) {
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
