import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIstUnlockClock } from "@/hooks/useIstUnlockClock";
import ImportantMoon from "@/components/important/ImportantMoon";
import ImportantPage from "@/components/important/ImportantPage";
import ImportantPasswordPage from "@/components/important/ImportantPasswordPage";
import ImportantPersonalPage from "@/components/important/ImportantPersonalPage";
import { trackImportantEvent } from "@/lib/siteTracking";

export default function ImportantSecret() {
  const { remainingMs, unlocked } = useIstUnlockClock();
  const [stage, setStage] = useState(null);
  const [password, setPassword] = useState(null);

  const close = useCallback(() => {
    setStage(null);
    setPassword(null);
  }, []);
  const openCountdown = useCallback(() => {
    trackImportantEvent("opened");
    setStage("countdown");
  }, []);
  const openPassword = useCallback(() => setStage("password"), []);
  const openPersonal = useCallback((verifiedPassword) => {
    setPassword(verifiedPassword);
    setStage("personal");
  }, []);

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
        <ImportantMoon unlocked={unlocked} />
      </motion.button>

      <AnimatePresence mode="wait">
        {stage === "countdown" && (
          <ImportantPage key="countdown" unlocked={unlocked} remainingMs={remainingMs} onEnter={openPassword} onClose={close} />
        )}
        {stage === "password" && <ImportantPasswordPage key="password" onUnlock={openPersonal} onClose={close} />}
        {stage === "personal" && <ImportantPersonalPage key="personal" password={password} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
