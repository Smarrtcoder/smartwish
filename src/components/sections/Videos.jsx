import { memo, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ASSETS } from "../../data";
import { Header } from "./Story";
import LazyVideo from "../LazyVideo";
import { ButterflyTransition } from "../Butterflies";

const SHAPES = [
  { name: "blob", radius: "60% 40% 55% 45% / 50% 60% 40% 50%" },
  { name: "cloud", radius: "50% 50% 45% 45% / 62% 62% 40% 40%" },
  { name: "rounded", radius: "26px" },
  { name: "petal", radius: "45% 45% 45% 45% / 55% 55% 45% 45%" },
];

const HangingFrame = memo(function HangingFrame({ v, i, threadLen, swing, show }) {
  const shape = SHAPES[i % SHAPES.length];
  return (
    <motion.div className="relative flex flex-col items-center flex-shrink-0"
      initial={{ opacity: 0, y: -60 }} animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.12, type: "spring", stiffness: 55, damping: 12 }}>
      <div className="w-2.5 h-2.5 rounded-full z-10" style={{ background: "radial-gradient(circle,#f5c451,#b8902f)", boxShadow: "0 0 10px #f5c451" }} />
      <motion.div className="flex flex-col items-center"
        animate={{ rotate: [swing, -swing, swing] }} transition={{ duration: 4.5 + i, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "top center" }}>
        <div style={{ width: 2, height: threadLen, background: "linear-gradient(rgba(245,196,81,0.85),rgba(245,196,81,0.25))" }} />
        <motion.div className="p-2.5 glass glass-gold" style={{ borderRadius: shape.radius }}
          whileHover={{ scale: 1.06, boxShadow: "0 26px 60px rgba(236,72,153,0.45)" }}>
          <div className="overflow-hidden w-[200px] sm:w-[220px]" style={{ borderRadius: shape.radius }}>
            <LazyVideo src={v.src} className="w-full h-[310px]" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

export default function Videos({ lenisRef, storyEntered }) {
  const sentinel = useRef(null);
  const inView = useInView(sentinel, { once: true, amount: 0.15 });
  const [revealed, setRevealed] = useState(false);
  const [showBT, setShowBT] = useState(false);
  const originalDuration = useRef(1.3);

  // Warm CDN connections for the section videos without downloading them.
  // The LazyVideo component handles per-video preload via IntersectionObserver.
  useEffect(() => {
    if (!inView) return;
    ASSETS.videos.forEach((v) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = v.src;
      document.head.appendChild(link);
    });
  }, [inView]);

  // Trigger butterfly transition as soon as the Story section enters view,
  // so butterflies are already flying as the user scrolls toward us.
  useEffect(() => {
    if (!storyEntered || showBT || revealed) return;

    // Gentle slow-down for cinematic feel
    if (lenisRef && lenisRef.current) {
      originalDuration.current = lenisRef.current.options.duration || 1.3;
      lenisRef.current.options.duration = 1.8;
    }

    setShowBT(true);
  }, [storyEntered, showBT, revealed, lenisRef]);

  // Reveal videos as the butterflies complete — fires ~2s in,
  // overlapping the glow bloom for a seamless handoff
  const handleButterflyDone = () => {
    setRevealed(true);
    if (lenisRef && lenisRef.current) {
      setTimeout(() => {
        if (lenisRef.current) {
          lenisRef.current.options.duration = originalDuration.current;
        }
      }, 600);
    }
  };

  const upper = ASSETS.videos.slice(0, 2);
  const lower = ASSETS.videos.slice(2, 4);

  return (
    <section className="relative py-24 px-6 overflow-hidden" data-testid="videos-section">
      <div ref={sentinel} className="absolute top-0 h-[20vh] w-1" />
      {showBT && !revealed && <ButterflyTransition onDone={handleButterflyDone} />}

      <Header emoji="🎬" title="Moving Memories" subtitle="Some memories are even better in motion." />
      <motion.div
        className="max-w-4xl mx-auto flex flex-col gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={revealed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>
        <div className="flex justify-center gap-10 sm:gap-16 flex-wrap">
          {upper.map((v, i) => (<HangingFrame key={i} v={v} i={i} threadLen={44} swing={3.5} show={revealed} />))}
        </div>
        <div className="flex justify-center gap-10 sm:gap-16 flex-wrap mt-2">
          {lower.map((v, i) => (<HangingFrame key={i} v={v} i={i + 2} threadLen={70} swing={-3} show={revealed} />))}
        </div>
      </motion.div>
    </section>
  );
}
