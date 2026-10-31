import { useState } from "react";
import { motion, useAnimationControls, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { verifyImportantPassword } from "@/lib/importantPassword";
import { GoldButton, ImportantShell, StarField } from "@/components/important/ImportantShared";

const WRONG_MESSAGE = "Hmm... That's not quite right. Try again! ✨";
const ERROR_MESSAGE = "We couldn't check the password just now. Please try again.";

function PasswordBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <StarField count={90} />
      <motion.div className="absolute left-1/2 top-1/2 w-[140vmax] h-[140vmax] -translate-x-1/2 -translate-y-1/2"
        style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(245,236,200,0.09) 10deg, transparent 22deg, transparent 60deg, rgba(245,236,200,0.07) 72deg, transparent 84deg, transparent 150deg, rgba(245,236,200,0.08) 162deg, transparent 176deg, transparent 240deg, rgba(245,236,200,0.07) 252deg, transparent 266deg, transparent 330deg, rgba(245,236,200,0.09) 342deg, transparent 356deg)" }}
        animate={{ rotate: 360 }} transition={{ duration: 140, repeat: Infinity, ease: "linear" }} />
      <div className="absolute -top-16 -right-16 sm:top-6 sm:right-10 w-44 h-44 sm:w-56 sm:h-56 rounded-full"
        style={{ background: "radial-gradient(circle at 40% 40%, #fffbeb 0%, #f3e3b0 35%, rgba(243,227,176,0.25) 60%, transparent 72%)", boxShadow: "0 0 80px 20px rgba(245,236,200,0.25)" }} />
      <motion.div className="absolute top-[18%] left-[8%] w-16 h-16 sm:w-24 sm:h-24 rounded-2xl glass"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: [0, 360], rotateY: [0, 360], y: [0, -18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute bottom-[14%] right-[10%] w-20 h-20 sm:w-28 sm:h-28 rounded-full glass"
        animate={{ y: [0, 20, 0], rotate: [0, 25, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

export default function ImportantPasswordPage({ onUnlock, onClose }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState(null);
  const shakeControls = useAnimationControls();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTilt = () => { mx.set(0); my.set(0); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    setStatus(null);
    try {
      const ok = await verifyImportantPassword(value);
      if (ok) {
        onUnlock();
        return;
      }
      setStatus("wrong");
      shakeControls.start({ x: [0, -14, 14, -10, 10, -5, 5, 0], transition: { duration: 0.6 } });
    } catch {
      setStatus("error");
    } finally {
      setChecking(false);
    }
  };

  return (
    <ImportantShell label="Secret password" onClose={onClose} backdrop={<PasswordBackdrop />}>
      <div className="flex min-h-full items-center justify-center px-5 py-24 sm:px-8" style={{ perspective: 1200 }}>
        <motion.div className="w-full max-w-md"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: "easeOut" }}>
          <motion.div animate={shakeControls}>
            <motion.div onPointerMove={handlePointerMove} onPointerLeave={resetTilt}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="glass relative rounded-[2rem] px-7 py-10 sm:px-10 sm:py-12 text-center"
              >
              <div className="absolute inset-0 rounded-[2rem] pointer-events-none"
                style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 70px rgba(245,196,81,0.18), inset 0 1px 1px rgba(255,255,255,0.15)" }} />
              <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#fff3d6] leading-[1.2]"
                style={{ textShadow: "0 0 24px rgba(245,196,81,0.4)" }}>
                A Little Secret Awaits You...
              </h2>
              <p className="font-body text-base text-[#c9c1ea] leading-[1.5] mt-4">
                Before entering, there's just one little thing.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                <div className="relative">
                  <input id="important-password" type={show ? "text" : "password"} value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter your secret password..." autoComplete="off" autoFocus
                    aria-invalid={status === "wrong"}
                    className="w-full rounded-2xl border border-[#f5c451]/25 bg-[#140e2e]/70 pl-5 pr-14 py-4 font-body text-base text-[#fff3d6] placeholder:text-[#a99fce] outline-none transition-all duration-500 focus:border-[#f5c451]/80 focus:shadow-[0_0_0_4px_rgba(245,196,81,0.15),0_0_32px_rgba(245,196,81,0.35)]" />
                  <button type="button" onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-2 text-[#e8c96b] transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c451]/70">
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <GoldButton type="submit" disabled={checking} className="w-full">
                  {checking ? "Checking..." : "Unlock My Message ✨"}
                </GoldButton>
              </form>

              <div className="mt-6 min-h-[3rem]" role="alert">
                <AnimatePresence mode="wait">
                  {status && (
                    <motion.p key={status} className="font-body text-sm sm:text-base text-[#f9a8d4] leading-[1.5]"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                      {status === "wrong" ? WRONG_MESSAGE : ERROR_MESSAGE}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </ImportantShell>
  );
}
