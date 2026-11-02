import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassMessage } from "@/components/important/ImportantShared";
import PollConfirmDialog from "@/components/important/PollConfirmDialog";
import { loadPollChoice, recordPollSelection, recordPollView, submitPollChoice } from "@/lib/finalPoll";

const OPTIONS = [
  { value: "keep", label: "Keep This Website ❤️" },
  { value: "let_go", label: "Let It Go ✨" },
];
const SUCCESS_MESSAGE = "Your choice has been recorded. Thank you for sharing what you wish. ❤️";
const SAME_CHOICE_MESSAGE = "This is already your current choice.";
const LOAD_ERROR = "We couldn't load your previous choice just now. You can still make a choice below.";
const SAVE_ERROR = "We couldn't save your choice just now. Please try again.";

const NOTICE_TONE = {
  success: "text-[#fde68a]",
  error: "text-[#f9a8d4]",
  info: "text-[#e6dcff]",
};

function PollOptionCard({ label, selected, disabled, onSelect }) {
  return (
    <motion.button type="button" onClick={onSelect} disabled={disabled} aria-pressed={selected}
      whileHover={disabled ? undefined : { y: -4, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`flex min-h-[7.5rem] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border px-6 py-7 text-center font-serif-display text-xl sm:text-2xl font-semibold text-[#fff3d6] leading-[1.2] transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c451]/70 disabled:cursor-not-allowed disabled:opacity-70 ${
        selected
          ? "border-[#f5c451] bg-[#f5c451]/15 shadow-[0_0_32px_rgba(245,196,81,0.35)]"
          : "border-[#f5c451]/30 bg-white/5 hover:border-[#f5c451]/70 hover:bg-white/10"
      }`}>
      <span>{label}</span>
      {selected && (
        <span className="mt-3 font-body text-xs uppercase tracking-[0.2em] text-[#e8c96b]">Your choice</span>
      )}
    </motion.button>
  );
}

export default function FinalPoll() {
  const sectionRef = useRef(null);
  const viewedRef = useRef(false);
  const [choice, setChoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;
    loadPollChoice()
      .then((current) => { if (active) setChoice(current?.option ?? null); })
      .catch(() => { if (active) setLoadFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !viewedRef.current) {
        viewedRef.current = true;
        recordPollView();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleSelect = (value) => {
    if (saving) return;
    if (value === choice) {
      setNotice({ type: "info", text: SAME_CHOICE_MESSAGE });
      return;
    }
    setNotice(null);
    recordPollSelection(value);
    setPending(value);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const result = await submitPollChoice(pending);
      setChoice(result.option);
      setNotice({ type: "success", text: SUCCESS_MESSAGE });
    } catch {
      setNotice({ type: "error", text: SAVE_ERROR });
    } finally {
      setSaving(false);
      setPending(null);
    }
  };

  const pendingLabel = OPTIONS.find((option) => option.value === pending)?.label;
  const statusText = notice?.text ?? (!loading && loadFailed ? LOAD_ERROR : null);
  const statusTone = notice ? NOTICE_TONE[notice.type] : "text-[#e6dcff]";

  return (
    <div ref={sectionRef} className="w-full" aria-labelledby="final-poll-heading">
      <GlassMessage>
        <div className="text-center">
          <h3 id="final-poll-heading" className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#fff3d6] leading-[1.2]">
            One Last Thing... ❤️
          </h3>
          <p className="mx-auto mt-4 max-w-xl font-body text-base sm:text-lg text-[#e6dcff] leading-[1.5]">
            Now that you've read everything, I want to know what you'd like to happen to this little corner of memories.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {OPTIONS.map((option) => (
            <PollOptionCard key={option.value} label={option.label} selected={choice === option.value}
              disabled={loading || saving} onSelect={() => handleSelect(option.value)} />
          ))}
        </div>

        <div className="mt-6 min-h-[3rem] text-center" role="status" aria-live="polite">
          {loading && <p className="font-body text-sm text-[#e6dcff]">Loading your choice...</p>}
          <AnimatePresence mode="wait">
            {!loading && statusText && (
              <motion.p key={statusText} className={`font-body text-sm sm:text-base leading-[1.5] ${statusTone}`}
                initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={notice?.type === "success" ? { textShadow: "0 0 18px rgba(245,196,81,0.55)" } : undefined}>
                {statusText}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </GlassMessage>

      <AnimatePresence>
        {pending && (
          <PollConfirmDialog key="poll-confirm" label={pendingLabel} busy={saving}
            onConfirm={handleConfirm} onCancel={() => setPending(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
