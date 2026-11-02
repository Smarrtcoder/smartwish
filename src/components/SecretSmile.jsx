import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Smile, X } from "lucide-react";
import AdminLogin from "@/components/admin/AdminLogin";

const SHOW_AFTER_MS = 30_000;
const REVEAL_HOLD_MS = 3_000;
const BOTTOM_THRESHOLD_PX = 24;

export default function SecretSmile() {
  const [timeReady, setTimeReady] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [panel, setPanel] = useState(null);
  const holdTimer = useRef(null);

  useEffect(() => {
    const id = setTimeout(() => setTimeReady(true), SHOW_AFTER_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const checkBottom = () => {
      const remaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      setAtBottom(remaining <= BOTTOM_THRESHOLD_PX);
    };
    checkBottom();
    window.addEventListener("scroll", checkBottom, { passive: true });
    window.addEventListener("resize", checkBottom);
    return () => {
      window.removeEventListener("scroll", checkBottom);
      window.removeEventListener("resize", checkBottom);
    };
  }, []);

  useEffect(() => () => clearTimeout(holdTimer.current), []);

  useEffect(() => {
    if (!panel) return;
    const onKey = (event) => {
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  const startHold = () => {
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setRevealed(true), REVEAL_HOLD_MS);
  };
  const cancelHold = () => clearTimeout(holdTimer.current);

  const visible = timeReady && atBottom;

  return (
    <>
      {visible && (
        <motion.button
          type="button"
          aria-label="Smile"
          onClick={() => revealed && setPanel("notice")}
          onPointerEnter={startHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onContextMenu={(event) => event.preventDefault()}
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0.25 }}
          transition={{ duration: 0.8 }}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[50] flex h-11 w-11 select-none items-center justify-center rounded-full border text-amber-300 transition-colors duration-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
            revealed ? "cursor-pointer border-amber-300/60 bg-slate-900/80 shadow-lg" : "cursor-default border-transparent bg-transparent"
          }`}
        >
          <Smile size={22} />
        </motion.button>
      )}

      {panel &&
        createPortal(
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 px-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setPanel(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={panel === "notice" ? "Notice" : "Private Access"}
              className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 pt-12 text-slate-100 shadow-2xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPanel(null)}
                aria-label="Close"
                className="absolute right-3 top-3 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <X size={18} />
              </button>
              {panel === "notice" ? (
                <button
                  type="button"
                  onClick={() => setPanel("access")}
                  className="block w-full text-center text-base leading-[1.5] text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Oops! Something went a little wrong. 😊
                </button>
              ) : (
                <AdminLogin onSuccess={() => window.location.assign("/admin")} />
              )}
            </motion.div>
          </motion.div>,
          document.body,
        )}
    </>
  );
}
