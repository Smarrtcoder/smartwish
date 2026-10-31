import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import "@/App.css";
import Intro from "@/components/Intro";
import { LivingBackground, MediaFlow, Divider } from "@/components/Ambience";
import { ASSETS } from "@/data";
import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import Gallery from "@/components/sections/Gallery";
import Videos from "@/components/sections/Videos";
import Reasons from "@/components/sections/Reasons";
import MemoryJar from "@/components/sections/MemoryJar";
import Letters, { SecretLetter } from "@/components/sections/Letters";
import CreatedForArshia from "@/components/sections/CreatedForArshia";
import MemoryExperience from "@/components/sections/MemoryExperience";
import Wheel from "@/components/sections/Wheel";
import Cake from "@/components/sections/Cake";
import { Compliments, BestFriendMeter } from "@/components/sections/Extras";
import Finale from "@/components/sections/Finale";
import ImportantSecret from "@/components/important/ImportantSecret";

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [storyEntered, setStoryEntered] = useState(false);
  const [inMemories, setInMemories] = useState(false);
  const audioRef = useRef(null);
  const startedRef = useRef(false);
  const lenisRef = useRef(null);

  // start music exactly once, when ARSHIA intro appears
  const startMusic = useCallback(() => {
    if (startedRef.current || !audioRef.current) return;
    startedRef.current = true;
    const a = audioRef.current;
    a.volume = 0;
    a.play().then(() => {
      let v = 0;
      const id = setInterval(() => { v += 0.02; if (v >= 0.7) { v = 0.7; clearInterval(id); } a.volume = v; }, 120);
    }).catch(() => {});
  }, []);

  const handleUnlock = useCallback(() => setUnlocked(true), []);
  const handleStoryEnter = useCallback(() => setStoryEntered(true), []);

  useEffect(() => {
    if (!unlocked) return;
    const lenis = new Lenis({ duration: 1.3, smoothWheel: true, lerp: 0.08 });
    lenisRef.current = lenis;
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); lenisRef.current = null; };
  }, [unlocked]);

  return (
    <div className="App grain">
      <audio ref={audioRef} src={ASSETS.music} loop preload="auto" />

      {!unlocked && <Intro onUnlock={handleUnlock} onMusicStart={startMusic} />}

      {unlocked && (
        <>
          <LivingBackground />
          <MediaFlow />
          <main className="relative z-[1]">
            <Hero />
            <Divider />
            <Gallery />
            <Divider flip />
            <Story onStoryEnter={handleStoryEnter} />
            <Divider />
            <Videos lenisRef={lenisRef} storyEntered={storyEntered} />
            <Divider flip />
            <Reasons />
            <Divider />
            <MemoryJar />
            <Divider flip />
            <CreatedForArshia onEnter={() => setInMemories(true)} />
            <Divider />
            <Letters />
            <Divider />
            <Wheel />
            <Cake />
            <Divider flip />
            <Compliments />
            <BestFriendMeter />
            <SecretLetter />
            <Divider />
            <Finale />
          </main>
          <ImportantSecret />
        </>
      )}

      <AnimatePresence>
        {inMemories && (
          <MemoryExperience onClose={() => setInMemories(false)} audioRef={audioRef} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
