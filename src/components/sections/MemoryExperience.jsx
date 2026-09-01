import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MEMORY_VIDEOS } from "../../data-videos";

const SPARK_COLORS = ["#f5c451", "#ffffff", "#f9a8d4", "#c4b5fd"];
const FLOWER_EMOJIS = ["🌸", "🌺", "🌷", "🌼", "💮", "🏵️"];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/* ---- Lightweight background decorations for the immersive page ---- */
function MemoryUniverse() {
  const stars = useRef(
    Array.from({ length: 80 }).map((_, i) => ({ id: i, x: rand(0, 100), y: rand(0, 100), s: rand(1, 3), dur: rand(2, 5), delay: rand(0, 4) }))
  ).current;

  const particles = useRef(
    Array.from({ length: 12 }).map((_, i) => ({ id: i, x: rand(5, 95), y: rand(5, 95), dur: rand(3, 6), delay: i * 0.4, color: SPARK_COLORS[i % SPARK_COLORS.length] }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "radial-gradient(70% 60% at 30% 25%, rgba(139,92,246,0.35), transparent 60%), radial-gradient(60% 55% at 80% 30%, rgba(236,72,153,0.28), transparent 62%), radial-gradient(80% 70% at 50% 95%, rgba(109,40,217,0.4), transparent 60%), linear-gradient(160deg, #06061a 0%, #120a2e 50%, #08081f 100%)" }}>
      {stars.map((s) => (
        <motion.span key={s.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, boxShadow: "0 0 6px rgba(255,255,255,0.7)" }}
          animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}
      {particles.map((p) => (
        <motion.span key={p.id} className="absolute rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: 3, height: 3, background: p.color, boxShadow: `0 0 8px ${p.color}` }}
          animate={{ opacity: [0, 1, 0], y: [0, -50], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }} />
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

/* ---- Fast cinematic intro text ---- */
function CinematicIntro({ onDone }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <motion.div className="absolute inset-0 z-[20] flex flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.6 }}>
      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.h2 key="a" className="font-serif-display text-3xl md:text-5xl font-bold text-[#f5edd6] text-center px-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            style={{ textShadow: "0 0 30px rgba(245,196,81,0.5), 0 2px 10px rgba(0,0,0,0.6)" }}>
            Created For Arshia ♡
          </motion.h2>
        )}
        {phase === 1 && (
          <motion.h2 key="b" className="font-hand text-2xl md:text-4xl text-[#f5c451] gold-glow text-center px-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}>
            A Little World Made Just For You
          </motion.h2>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---- Decorative hearts/sparkles for the message panel ---- */
function MessageDecor() {
  const items = useRef(
    Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      x: rand(5, 95),
      y: rand(5, 95),
      dur: rand(3, 6),
      delay: rand(0, 3),
      emoji: ["♡", "✦", "⭐", "✧", "·"][i % 5],
      color: SPARK_COLORS[i % SPARK_COLORS.length],
    }))
  ).current;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {items.map((it) => (
        <motion.span
          key={it.id}
          className="absolute"
          style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: 12, color: it.color, textShadow: `0 0 8px ${it.color}` }}
          animate={{ opacity: [0, 0.8, 0], y: [0, -24, 0], scale: [0.6, 1.1, 0.6] }}
          transition={{ duration: it.dur, delay: it.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {it.emoji}
        </motion.span>
      ))}
    </div>
  );
}

/* ---- Lightweight flower cursor trail (desktop only, capped particle count) ---- */
function FlowerTrail() {
  const [flowers, setFlowers] = useState([]);
  const fid = useRef(0);
  const lastEmit = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const onMove = (e) => {
      const now = performance.now();
      if (now - lastEmit.current < 70) return;
      lastEmit.current = now;

      const id = fid.current++;
      const emoji = FLOWER_EMOJIS[id % FLOWER_EMOJIS.length];
      const drift = (Math.random() - 0.5) * 50;
      const rise = 40 + Math.random() * 50;
      const rot = (Math.random() - 0.5) * 90;
      const sz = 14 + Math.random() * 10;
      const life = 1.4 + Math.random() * 0.6;

      setFlowers((prev) => [...prev.slice(-18), { id, x: e.clientX, y: e.clientY, emoji, drift, rise, rot, sz, life }]);
      setTimeout(() => setFlowers((prev) => prev.filter((f) => f.id !== id)), life * 1000 + 100);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[70]">
      {flowers.map((f) => (
        <motion.span
          key={f.id}
          className="absolute"
          style={{ left: f.x, top: f.y, fontSize: f.sz, marginLeft: -f.sz / 2, marginTop: -f.sz / 2 }}
          initial={{ opacity: 0, scale: 0.3, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.4], x: f.drift, y: -f.rise, rotate: f.rot }}
          transition={{ duration: f.life, ease: "easeOut" }}
        >
          {f.emoji}
        </motion.span>
      ))}
    </div>
  );
}

/* ---- Cinematic end-of-video message transition ----
   Phase 1: message appears on the video's final frame (fade-in + scale)
   Phase 2: message flies upward into the empty space above the video
   Phase 3: message stays in the empty space (readable, stationary)
   Phase 4: message fades out, then the same video restarts
   Fly distance is measured dynamically from the container so it works
   on every screen size. No new assets, no network load. */
function computeHoldDuration(text) {
  const chars = text.length;
  if (chars <= 30) return 4.0;
  if (chars <= 60) return 4.5;
  if (chars <= 100) return 5.0;
  return 6.0;
}

function EndTransition({ message, onDone, videoWrapperRef }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [flyY, setFlyY] = useState(-150);
  const [flyX, setFlyX] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const wrapper = videoWrapperRef && videoWrapperRef.current;
    const text = textRef.current;
    if (!container || !wrapper) return;

    const containerRect = container.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const textRect = text ? text.getBoundingClientRect() : null;

    const currentY = containerRect.height / 2;
    const currentX = containerRect.width / 2;
    const videoTop = wrapperRect.top - containerRect.top;
    const textH = textRect ? textRect.height : 40;

    // Y: center of the blank space above the video
    const spaceTop = 70;
    const spaceBottom = videoTop - 20;
    const spaceMid = (spaceTop + spaceBottom) / 2;
    const minY = spaceTop + textH / 2;
    const targetY = Math.max(spaceMid, minY);
    setFlyY(targetY - currentY);

    // X: on desktop, shift right so the message settles in the gap
    // between the video and the "Happy Birthday" column, not directly
    // above the video center. On mobile (stacked layout) stay centered.
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop) {
      const videoRight = wrapperRect.right - containerRect.left;
      // Target: past the video's right edge, into the open gap area
      const targetX = videoRight + containerRect.width * 0.08;
      setFlyX(targetX - currentX);
    } else {
      setFlyX(0);
    }
  }, [videoWrapperRef]);

  const appearDur = 0.6;
  const flyDur = 1.2;
  const holdDur = computeHoldDuration(message);
  const fadeOutDur = 0.4;
  const total = appearDur + flyDur + holdDur + fadeOutDur;

  const t1 = appearDur / total;
  const t2 = (appearDur + flyDur) / total;
  const t3 = (appearDur + flyDur + holdDur) / total;

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Subtle dark overlay on the video area — fades in during appear,
          fades out as the message leaves the video */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.45, 0.12, 0.08, 0] }}
        transition={{ duration: total, times: [0, t1, t2, t3, 1], ease: "easeOut" }}
        style={{ background: "radial-gradient(ellipse at center, rgba(6,6,26,0.7) 0%, rgba(6,6,26,0.35) 55%, transparent 85%)" }}
      />
      <motion.p
        ref={textRef}
        className="relative font-hand text-center px-6 sm:px-8 max-w-[90%] sm:max-w-[75%]"
        style={{
          color: "#f5edd6",
          fontSize: "clamp(1.15rem, 4vw, 2rem)",
          lineHeight: 1.55,
          letterSpacing: "0.01em",
          fontWeight: 500,
          textShadow: "0 2px 16px rgba(0,0,0,0.85), 0 0 30px rgba(139,92,246,0.35), 0 0 12px rgba(245,196,81,0.2)",
        }}
        initial={{ opacity: 0, y: 0, x: 0, scale: 0.92 }}
        animate={{
          opacity: [0, 1, 1, 1, 0],
          y: [0, 0, flyY, flyY, flyY],
          x: [0, 0, flyX, flyX, flyX],
          scale: [0.92, 1, 1, 1, 1],
        }}
        transition={{
          duration: total,
          times: [0, t1, t2, t3, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
        onAnimationComplete={onDone}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}

/* ---- Video player: natural aspect ratio, no controls, auto-replay ----
   Videos 1-9 use object-contain so the browser sizes them naturally.
   Video 10 gets a scale-down to ensure the full frame is visible.
   Uses preload="metadata" + Cloudinary poster for fast startup; original
   Cloudinary URLs support byte-range requests so the browser streams
   progressively without waiting for the full file.
   On ended: shows a cinematic message transition over the final frame,
   then restarts the same video from 0:00. */
function VideoPlayer({ video, index, videoRef }) {
  const isFirst = index === 0;
  const isTenth = index === MEMORY_VIDEOS.length - 1;
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [showEndMsg, setShowEndMsg] = useState(false);
  const videoWrapperRef = useRef(null);

  // Autoplay on src change — the parent controls mounting so this is the new video
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    setError(false);
    setShowEndMsg(false);
    el.play().catch(() => {});
  }, [video.src, videoRef, retryKey]);

  const handleError = () => setError(true);
  const handleRetry = () => { setError(false); setRetryKey((k) => k + 1); };

  const handleEnded = () => {
    setShowEndMsg(true);
  };

  const handleEndTransitionDone = () => {
    setShowEndMsg(false);
    const el = videoRef.current;
    if (el) {
      el.currentTime = 0;
      el.play().catch(() => {});
    }
  };

  // Videos 1-9: natural contain sizing. Video 10: force maxHeight slightly smaller
  // so the full frame stays visible without any cropping from the container.
  const videoStyle = isTenth
    ? { maxWidth: "100%", maxHeight: "88%", objectFit: "contain", background: "#0a0a1f", transform: "scale(0.92)" }
    : { maxWidth: "100%", maxHeight: "100%", objectFit: "contain", background: "#0a0a1f" };

  return (
    <motion.div
      key={video.src}
      className="relative flex flex-col items-center justify-center w-full h-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div ref={videoWrapperRef} className="relative rounded-2xl overflow-hidden glass glass-gold flex items-center justify-center" style={{ maxHeight: "100%" }}>
        <div className="absolute top-0 left-0 right-0 h-px z-10" style={{ background: "linear-gradient(90deg, transparent, rgba(245,196,81,0.6), rgba(244,114,182,0.5), transparent)" }} />
        {error ? (
          <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: "200px" }}>
            <p className="font-body text-sm text-[#a99fce]">Couldn't load this video.</p>
            <button onClick={handleRetry} data-testid="video-retry" className="px-6 py-2.5 rounded-full font-body text-sm text-white" style={{ background: "linear-gradient(120deg,#8b5cf6,#ec4899)" }}>Try again</button>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={video.src}
            poster={video.poster}
            playsInline
            preload="metadata"
            autoPlay
            onEnded={handleEnded}
            onError={handleError}
            key={retryKey}
            className="block"
            style={videoStyle}
          />
        )}
      </div>
      <AnimatePresence>
        {showEndMsg && !error && (
          <EndTransition message={video.message} onDone={handleEndTransitionDone} videoWrapperRef={videoWrapperRef} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---- Full immersive experience (fullscreen overlay) ---- */
export default function MemoryExperience({ onClose, audioRef }) {
  const [index, setIndex] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const touchStartX = useRef(null);
  const musicPausedRef = useRef(false);
  const musicTimeRef = useRef(0);
  const musicVolumeRef = useRef(0);
  const videoRef = useRef(null);

  // Pause website music on entry, preserve position + volume
  useEffect(() => {
    if (audioRef && audioRef.current) {
      const a = audioRef.current;
      musicTimeRef.current = a.currentTime;
      musicVolumeRef.current = a.volume;
      a.pause();
      musicPausedRef.current = true;
    }
    return () => {
      if (audioRef && audioRef.current && musicPausedRef.current) {
        const a = audioRef.current;
        a.currentTime = musicTimeRef.current;
        a.volume = musicVolumeRef.current;
        a.play().catch(() => {});
        musicPausedRef.current = false;
      }
    };
  }, [audioRef]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Fully stop + cleanup the current video before switching
  const stopCurrentVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    el.muted = false;
    // Remove src to halt any remaining audio decode, then re-set (the new src
    // is applied by the remounted VideoPlayer via key change)
    el.removeAttribute("src");
    el.load();
  }, []);

  const goNext = useCallback(() => {
    stopCurrentVideo();
    setIndex((i) => (i + 1 >= MEMORY_VIDEOS.length ? 0 : i + 1));
  }, [stopCurrentVideo]);

  const goPrev = useCallback(() => {
    stopCurrentVideo();
    setIndex((i) => (i - 1 < 0 ? 0 : i - 1));
  }, [stopCurrentVideo]);

  const isFirst = index === 0;
  const isLast = index === MEMORY_VIDEOS.length - 1;

  // Keyboard controls: Space=play/pause, Arrows=seek, Up/Down=volume, M=mute, Escape=close
  useEffect(() => {
    if (!introDone) return;
    const onKey = (e) => {
      const el = videoRef.current;
      // Prevent page scroll for keys we handle
      if ([" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === "Escape") { onClose(); return; }
      if (e.key === " ") {
        if (!el) return;
        if (el.paused) el.play().catch(() => {});
        else el.pause();
        return;
      }
      if (e.key === "ArrowRight") {
        if (!el) return;
        el.currentTime = Math.min(el.currentTime + 5, el.duration || 0);
        return;
      }
      if (e.key === "ArrowLeft") {
        if (!el) return;
        el.currentTime = Math.max(el.currentTime - 5, 0);
        return;
      }
      if (e.key === "ArrowUp") {
        if (!el) return;
        el.volume = Math.min(el.volume + 0.1, 1);
        return;
      }
      if (e.key === "ArrowDown") {
        if (!el) return;
        el.volume = Math.max(el.volume - 0.1, 0);
        return;
      }
      if (e.key === "m" || e.key === "M") {
        if (!el) return;
        el.muted = !el.muted;
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introDone, onClose]);

  // Touch swipe
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      if (dx < 0) goNext();
      else if (!isFirst) goPrev();
    }
    touchStartX.current = null;
  };

  // Warm the next video's CDN connection (DNS + TCP + TLS) without downloading
  // the full file. The browser's own video preload="metadata" will fetch
  // just the first chunk when the next VideoPlayer mounts.
  useEffect(() => {
    if (!introDone) return;
    const nextIdx = (index + 1) % MEMORY_VIDEOS.length;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = MEMORY_VIDEOS[nextIdx].src;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [index, introDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{ height: "100dvh" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <MemoryUniverse />

      <FlowerTrail />

      {/* Back button */}
      <motion.button
        onClick={onClose}
        data-testid="back-to-birthday"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="absolute top-5 left-5 z-[60] flex items-center gap-2 px-5 py-3 rounded-xl glass font-body text-sm text-[#f5edd6] tracking-wide"
      >
        <motion.span animate={{ x: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>←</motion.span>
        Back to Birthday ♡
      </motion.button>

      {/* Video number indicator */}
      <div className="absolute top-6 right-5 z-[60] font-body text-sm text-[#a99fce] tracking-[0.3em]">
        {String(index + 1).padStart(2, "0")} / {String(MEMORY_VIDEOS.length).padStart(2, "0")}
      </div>

      {!introDone && <CinematicIntro onDone={() => setIntroDone(true)} />}

      {/* Main two-column layout — fixed to viewport, no page scroll */}
      <div
        className="absolute inset-0 z-[10] flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 px-4 pt-16 pb-4"
        style={{ height: "100dvh", boxSizing: "border-box" }}
      >
        {/* LEFT: video area (~60%) */}
        <div
          className="flex items-center justify-center w-full md:w-[62%]"
          style={{ height: "100%", minHeight: 0 }}
        >
          <AnimatePresence mode="wait">
            <VideoPlayer
              key={MEMORY_VIDEOS[index].src}
              video={MEMORY_VIDEOS[index]}
              index={index}
              videoRef={videoRef}
            />
          </AnimatePresence>
        </div>

        {/* RIGHT: birthday message + navigation buttons (~38%) */}
        {introDone && (
          <motion.div
            className="relative w-full md:w-[35%] flex flex-col items-center text-center px-4"
            style={{ maxHeight: "100%" }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <MessageDecor />

            {/* Heading */}
            <motion.h2
              className="font-serif-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
              style={{ textShadow: "0 0 30px rgba(245,196,81,0.5), 0 0 20px rgba(236,72,153,0.3), 0 2px 10px rgba(0,0,0,0.6)" }}
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="grad-text">Happy Birthday</span>
              <br />
              <span className="text-[#f5edd6]">Arshia Ma'am ♡</span>
            </motion.h2>

            {/* Message */}
            <motion.p
              className="font-hand text-lg md:text-xl text-[#f5edd6] leading-relaxed mt-5 max-w-xs"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Ma'am, yeh kuch cutie kiddo ki cute videos banayi hain maine to make your birthday little more special. Hope you will like them. ♡
            </motion.p>

            {/* Previous + Next buttons */}
            <div className="flex items-center gap-4 mt-7">
              {/* Previous — disabled on video 1 */}
              <motion.button
                onClick={goPrev}
                data-testid="prev-video"
                whileHover={isFirst ? {} : { scale: 1.05 }}
                whileTap={isFirst ? {} : { scale: 0.95 }}
                className="relative inline-flex items-center gap-2 px-6 py-4 rounded-2xl glass font-body text-base text-[#f5edd6] tracking-wide"
                style={isFirst ? { opacity: 0.3, cursor: "not-allowed", pointerEvents: "none" } : {}}
                aria-label="Previous video"
              >
                <motion.span animate={{ x: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>←</motion.span>
                Previous
              </motion.button>

              {/* Next / Replay */}
              <motion.button
                onClick={goNext}
                data-testid="next-video"
                whileHover={{ scale: 1.05, boxShadow: "0 16px 50px rgba(139,92,246,0.5), 0 0 36px rgba(245,196,81,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass glass-gold font-body text-base text-[#f5edd6] tracking-wide"
                animate={{ boxShadow: ["0 10px 36px rgba(139,92,246,0.2), 0 0 26px rgba(245,196,81,0.12)", "0 10px 36px rgba(139,92,246,0.38), 0 0 36px rgba(245,196,81,0.22)", "0 10px 36px rgba(139,92,246,0.2), 0 0 26px rgba(245,196,81,0.12)"] }}
                transition={{ boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
              >
                <span className="text-base">✦</span>
                {isLast ? "Replay Memories ♡" : "Next Video"}
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
              </motion.button>
            </div>

            {/* mobile swipe hint */}
            <motion.p
              className="md:hidden font-body text-xs text-[#a99fce] mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              swipe ← → to browse
            </motion.p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
