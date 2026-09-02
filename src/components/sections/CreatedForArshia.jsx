import { useRef } from "react";
import { motion } from "framer-motion";
import { MEMORY_VIDEOS } from "../../data-videos";
import { Header } from "./Story";

const SPARK_COLORS = ["#f5c451", "#ffffff", "#f9a8d4", "#c4b5fd"];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/* Pre-generated orbiting trail particles around the CTA button border.
   Each particle traces a rectangular offset-path at its own timing,
   size, opacity, and color so the effect feels organic and layered. */
const TRAIL_EMOJIS = ["🌸", "♡", "✦", "✧", "·", "❀", "⋆", "♡"];
const TRAIL_COLORS = ["#f9a8d4", "#f5c451", "#c4b5fd", "#ffffff", "#f9a8d4", "#f5c451", "#c4b5fd", "#ffffff"];
const TRAIL_SIZES = [9, 11, 8, 13, 7, 10, 9, 12, 8, 11, 7, 10];

const BORDER_TRAIL = Array.from({ length: 12 }).map((_, i) => {
  const w = 150;
  const h = 32;
  const expand = 16;
  const ew = w + expand;
  const eh = h + expand;
  const path = `M ${-ew / 2},${-eh / 2} L ${ew / 2},${-eh / 2} L ${ew / 2},${eh / 2} L ${-ew / 2},${eh / 2} Z`;
  return {
    id: i,
    emoji: TRAIL_EMOJIS[i % TRAIL_EMOJIS.length],
    color: TRAIL_COLORS[i % TRAIL_COLORS.length],
    size: TRAIL_SIZES[i % TRAIL_SIZES.length],
    path,
    dur: 6 + (i % 5) * 1.5,
    delay: i * 0.7,
    maxOpacity: 0.6 + (i % 4) * 0.12,
  };
});

/* ---- Lightweight floating decorations (CSS-driven, GPU-friendly) ---- */
function DecorField({ count = 14 }) {
  const items = useRef(
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: rand(2, 98),
      y: rand(5, 95),
      s: rand(2, 5),
      dur: rand(3, 7),
      delay: rand(0, 4),
      emoji: ["✦", "♡", "⭐", "·", "✧"][i % 5],
    }))
  ).current;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((it) => (
        <motion.span
          key={it.id}
          className="absolute"
          style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: it.s + 8, color: SPARK_COLORS[it.id % SPARK_COLORS.length], textShadow: `0 0 8px ${SPARK_COLORS[it.id % SPARK_COLORS.length]}` }}
          animate={{ opacity: [0, 0.8, 0], y: [0, -30, 0], scale: [0.6, 1.1, 0.6] }}
          transition={{ duration: it.dur, delay: it.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {it.emoji}
        </motion.span>
      ))}
    </div>
  );
}

/* ---- Festive fairy lights along the top edge ---- */
function FairyLights() {
  const lights = useRef(
    Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: (100 / 17) * i,
      dur: rand(1.8, 3.5),
      delay: rand(0, 2),
      color: SPARK_COLORS[i % SPARK_COLORS.length],
      sway: rand(-3, 3),
    }))
  ).current;
  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "40px" }}>
      {/* string wire */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
        <path d="M0,8 Q25,22 50,12 T100,10" fill="none" stroke="rgba(245,196,81,0.25)" strokeWidth="1" />
      </svg>
      {lights.map((l) => (
        <motion.span
          key={l.id}
          className="absolute"
          style={{
            left: `${l.left}%`,
            top: "12px",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: l.color,
            boxShadow: `0 0 10px ${l.color}, 0 0 20px ${l.color}`,
          }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, l.sway, 0] }}
          transition={{ duration: l.dur, delay: l.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ---- Paper bunting / triangle flags along the bottom edge ---- */
function Bunting() {
  const flags = useRef(
    Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: (100 / 13) * i,
      color: SPARK_COLORS[i % SPARK_COLORS.length],
      sway: rand(2, 5),
      delay: rand(0, 1.5),
    }))
  ).current;
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none flex justify-center" style={{ height: "28px" }}>
      {flags.map((f) => (
        <motion.div
          key={f.id}
          className="absolute"
          style={{ left: `${f.left}%`, bottom: 0 }}
          animate={{ rotate: [-f.sway, f.sway, -f.sway] }}
          transition={{ duration: rand(2.5, 4), delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: `20px solid ${f.color}`,
              opacity: 0.55,
              filter: `drop-shadow(0 0 4px ${f.color})`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ---- Hanging bulbs on the side edges ---- */
function HangingBulbs({ side }) {
  const bulbs = useRef(
    Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      top: 15 + i * 18,
      dur: rand(2, 4),
      delay: rand(0, 2),
      color: SPARK_COLORS[(i + 1) % SPARK_COLORS.length],
    }))
  ).current;
  const style = side === "left" ? { left: "8px" } : { right: "8px" };
  return (
    <div className="absolute top-0 bottom-0 pointer-events-none" style={style}>
      {bulbs.map((b) => (
        <motion.div
          key={b.id}
          className="absolute"
          style={{ top: `${b.top}%` }}
          animate={{ x: [0, side === "left" ? 3 : -3, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* thin wire */}
          <div style={{ width: 1, height: 14, margin: "0 auto", background: "rgba(245,196,81,0.2)" }} />
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: b.color,
              boxShadow: `0 0 8px ${b.color}, 0 0 16px ${b.color}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ---- Main website section (decorated CTA card) ---- */
export default function CreatedForArshia({ onEnter }) {
  return (
    <section className="relative py-24 px-6" data-testid="created-for-arshia-section">
      <Header emoji="♡" title="Created For Arshia, With Love" subtitle="10 little moments, made just for you." />

      <div className="max-w-3xl mx-auto relative">
        <DecorField count={16} />

        <motion.div
          className="relative crystal-glass rounded-3xl px-8 py-14 md:px-16 md:py-20 text-center overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* festive decorations — only inside this card */}
          <FairyLights />
          <Bunting />
          <HangingBulbs side="left" />
          <HangingBulbs side="right" />

          {/* warm ambient glow */}
          <div className="absolute inset-0 -z-10 blur-3xl opacity-60" style={{ background: "radial-gradient(circle at 50% 35%, rgba(245,196,81,0.15), rgba(139,92,246,0.25), rgba(236,72,153,0.15), transparent 75%)" }} />

          {/* glowing border accents */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,196,81,0.7), rgba(244,114,182,0.6), transparent)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(196,181,253,0.6), rgba(245,196,81,0.6), transparent)" }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-4"
          >
            <span className="text-2xl">✦</span>
          </motion.div>

          <h3 className="font-serif-display text-3xl md:text-5xl font-bold mb-3 grad-text">
            Created For Arshia, With Love ♡
          </h3>
          <p className="font-hand text-2xl md:text-3xl text-[#f5c451] gold-glow mb-10">
            10 little moments, made just for you.
          </p>

          {/* glowing golden tap prompt — replaces old number buttons */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.p
              className="font-hand text-lg md:text-2xl text-center px-6 py-3 rounded-full inline-block"
              style={{
                color: "#f5c451",
                textShadow: "0 0 12px rgba(245,196,81,0.6), 0 0 24px rgba(245,196,81,0.3)",
                background: "rgba(245,196,81,0.06)",
                border: "1px solid rgba(245,196,81,0.2)",
              }}
              animate={{
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.03, 1],
                textShadow: [
                  "0 0 12px rgba(245,196,81,0.6), 0 0 24px rgba(245,196,81,0.3)",
                  "0 0 18px rgba(245,196,81,0.8), 0 0 36px rgba(245,196,81,0.5)",
                  "0 0 12px rgba(245,196,81,0.6), 0 0 24px rgba(245,196,81,0.3)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              Jaldi neeche tap karo, Arshia ji ✨
            </motion.p>
          </motion.div>

          {/* Enter CTA — enhanced premium glow with shimmer + rich orbiting border trail */}
          <div className="relative inline-block">
            {/* Orbiting decorative trail — many elements tracing the button border */}
            <div className="absolute pointer-events-none" style={{ inset: -16 }}>
              {BORDER_TRAIL.map((p) => (
                <motion.span
                  key={p.id}
                  className="absolute"
                  style={{
                    fontSize: p.size,
                    color: p.color,
                    textShadow: `0 0 6px ${p.color}, 0 0 12px ${p.color}`,
                    left: "50%",
                    top: "50%",
                    offsetPath: `path("${p.path}")`,
                    offsetRotate: "0deg",
                  }}
                  animate={{
                    offsetDistance: ["0%", "100%"],
                    opacity: [0, p.maxOpacity, p.maxOpacity, 0, 0],
                    scale: [0.7, 1, 1, 0.7, 0.7],
                  }}
                  transition={{
                    duration: p.dur,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.05, 0.5, 0.55, 1],
                  }}
                >
                  {p.emoji}
                </motion.span>
              ))}
            </div>

            <motion.button
              onClick={onEnter}
              data-testid="enter-memories"
              whileHover={{ scale: 1.06, boxShadow: "0 24px 70px rgba(139,92,246,0.55), 0 0 50px rgba(245,196,81,0.4), 0 0 80px rgba(236,72,153,0.25)" }}
              whileTap={{ scale: 0.95 }}
              className="relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-body text-lg text-[#f5edd6] tracking-wide overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.15), rgba(245,196,81,0.12))",
                border: "1.5px solid rgba(245,196,81,0.45)",
                backdropFilter: "blur(12px)",
              }}
              animate={{
                boxShadow: [
                  "0 10px 40px rgba(139,92,246,0.3), 0 0 30px rgba(245,196,81,0.2), inset 0 0 20px rgba(245,196,81,0.05)",
                  "0 14px 50px rgba(139,92,246,0.45), 0 0 45px rgba(245,196,81,0.35), inset 0 0 30px rgba(245,196,81,0.1)",
                  "0 10px 40px rgba(139,92,246,0.3), 0 0 30px rgba(245,196,81,0.2), inset 0 0 20px rgba(245,196,81,0.05)",
                ],
                borderColor: [
                  "rgba(245,196,81,0.4)",
                  "rgba(245,196,81,0.65)",
                  "rgba(245,196,81,0.4)",
                ],
              }}
              transition={{
                boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                borderColor: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              {/* Shimmer sweep — golden light traveling across the button */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(110deg, transparent 30%, rgba(255,240,200,0.35) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                }}
                animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
              />
              <span className="relative text-xl" style={{ textShadow: "0 0 10px rgba(245,196,81,0.6)" }}>✦</span>
              <span className="relative">Enter The Memories</span>
              <motion.span className="relative" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
