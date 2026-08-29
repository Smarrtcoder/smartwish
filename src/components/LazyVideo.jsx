import { useEffect, useRef, useState } from "react";

/*
  Performance-optimised lazy video:
  - preload="none" initially so off-screen videos download nothing
  - When within ~250px of viewport, switches to preload="metadata" (fetches
    only the first few hundred KB — enough for the moov atom + first frame)
  - When actually visible, switches to preload="auto" so the browser
    progressively streams the rest via byte-range requests
  - IntersectionObserver controls play/pause based on visibility
  - Pauses when scrolled away to free memory
  - dark gradient background prevents blank placeholder before load
*/
export default function LazyVideo({ src, className = "", style = {}, objectPos = "center" }) {
  const ref = useRef(null);
  const [nearby, setNearby] = useState(false);
  const [visible, setVisible] = useState(false);

  // Stage 1 — proximity detection: fetch metadata before the video
  // actually enters the viewport so playback starts quickly on arrival.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const proximity = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setNearby(true);
        });
      },
      { rootMargin: "250px 0px" }
    );
    proximity.observe(el);
    return () => proximity.disconnect();
  }, []);

  // Stage 2 — visibility: play when visible, pause when not.
  // Also upgrade preload to "auto" only when actually on-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tryPlay = () => {
      const p = el.play();
      if (p) p.catch(() => {});
    };

    const onCanPlay = () => {
      if (el.getBoundingClientRect().top < window.innerHeight && el.getBoundingClientRect().bottom > 0) {
        tryPlay();
      }
    };

    el.addEventListener("canplay", onCanPlay);

    const visibility = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            if (el.readyState >= 2) tryPlay();
          } else {
            setVisible(false);
            el.pause();
          }
        });
      },
      { threshold: 0.1 }
    );
    visibility.observe(el);

    return () => {
      visibility.disconnect();
      el.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  // preload strategy: none → metadata (nearby) → auto (visible)
  const preload = visible ? "auto" : nearby ? "metadata" : "none";

  return (
    <video
      ref={ref}
      src={nearby ? src : undefined}
      className={className}
      style={{
        objectFit: "cover",
        objectPosition: objectPos,
        background: "linear-gradient(135deg, #1a1238, #0f0a25)",
        ...style,
      }}
      autoPlay
      muted
      loop
      playsInline
      preload={preload}
      disablePictureInPicture
      // @ts-ignore
      disableRemotePlayback
    />
  );
}
