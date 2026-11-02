import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassMessage, GoldButton } from "@/components/important/ImportantShared";
import { MESSAGE_MAX_LENGTH, fetchImportantMessage, saveImportantMessage } from "@/lib/importantMessage";

const LOAD_ERROR = "We couldn't load your message just now.";
const SAVE_ERROR = "We couldn't save your message. Please try again.";

function MessageCard({ text }) {
  return (
    <GlassMessage>
      <p className="font-body text-base sm:text-lg text-[#e6dcff] leading-[1.5] whitespace-pre-wrap break-words">{text}</p>
    </GlassMessage>
  );
}

export default function ImportantMessageEditor({ password }) {
  const [draft, setDraft] = useState("");
  const [savedText, setSavedText] = useState("");
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetchImportantMessage(password)
      .then((body) => {
        if (!active) return;
        setDraft(body);
        setSavedText(body);
        setView(body ? "saved" : null);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadFailed(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [password, loadAttempt]);

  const retryLoad = () => {
    setLoading(true);
    setLoadFailed(false);
    setLoadAttempt((n) => n + 1);
  };

  const togglePreview = () => setView((v) => (v === "preview" ? null : "preview"));

  const handleSave = async () => {
    if (saving || loading) return;
    setSaving(true);
    setSaveFailed(false);
    try {
      await saveImportantMessage(password, draft);
      setSavedText(draft);
      setView("saved");
    } catch {
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const cardText = view === "preview" ? draft : savedText;
  const nearLimit = draft.length > MESSAGE_MAX_LENGTH * 0.9;

  return (
    <section className="flex w-full flex-col items-center">
      <div className="text-center">
        <h3 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#fff3d6] leading-[1.2]"
          style={{ textShadow: "0 0 30px rgba(245,196,81,0.35)" }}>
          Your Personal Message
        </h3>
        <p className="font-body text-base sm:text-lg text-[#c9c1ea] leading-[1.5] mt-3">
          Some words are meant to come straight from the heart.
        </p>
      </div>

      <div className="relative mt-8 w-full rounded-[2rem] border border-[#f5c451]/30 p-4 sm:p-6 transition-all duration-500 focus-within:border-[#f5c451]/80 focus-within:shadow-[0_0_0_4px_rgba(245,196,81,0.15),0_0_40px_rgba(245,196,81,0.3)]"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))",
          backdropFilter: "blur(16px) saturate(120%)",
          WebkitBackdropFilter: "blur(16px) saturate(120%)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.15)",
        }}>
        <label htmlFor="important-personal-message" className="sr-only">Your personal message</label>
        <textarea id="important-personal-message" value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write your heart out here..."
          maxLength={MESSAGE_MAX_LENGTH}
          rows={10}
          disabled={loading}
          className="w-full min-h-[14rem] resize-y bg-transparent font-body text-base sm:text-lg text-[#fff3d6] leading-[1.5] placeholder:text-[#a99fce] outline-none disabled:opacity-60" />
        <div className="mt-3 flex items-center justify-between font-body text-xs sm:text-sm">
          <span className="text-[#a99fce]">{loading ? "Loading your message..." : ""}</span>
          <span className={nearLimit ? "text-[#f9a8d4]" : "text-[#c9c1ea]"} aria-live="polite">
            {draft.length} / {MESSAGE_MAX_LENGTH}
          </span>
        </div>
      </div>

      {loadFailed && (
        <div className="mt-6 flex flex-col items-center gap-3" role="alert">
          <p className="font-body text-sm sm:text-base text-[#f9a8d4]">{LOAD_ERROR}</p>
          <button type="button" onClick={retryLoad}
            className="cursor-pointer rounded-full border border-[#f5c451]/50 px-5 py-2 font-body text-sm text-[#fff3d6] transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c451]/70">
            Try again
          </button>
        </div>
      )}

      <div className="mt-8 flex w-full flex-col-reverse items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
        <button type="button" onClick={togglePreview} disabled={loading}
          className="cursor-pointer rounded-full border border-[#f5c451]/40 bg-white/5 px-7 py-3 font-body text-base font-semibold text-[#fff3d6] transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c451]/70 disabled:cursor-not-allowed disabled:opacity-60">
          {view === "preview" ? "Hide Preview" : "Preview Message"}
        </button>
        <GoldButton type="button" onClick={handleSave} disabled={loading || saving} className="w-full sm:w-auto">
          {saving ? "Saving..." : "Save Message"}
        </GoldButton>
      </div>

      <div className="mt-4 min-h-[1.5rem]" role="alert">
        <AnimatePresence mode="wait">
          {saveFailed && (
            <motion.p key="save-error" className="font-body text-sm sm:text-base text-[#f9a8d4] text-center"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {SAVE_ERROR}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {view && (
          <motion.div key={view} className="mt-6 w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            {cardText.trim() ? (
              <MessageCard text={cardText} />
            ) : (
              <p className="font-body text-base text-[#c9c1ea] text-center">Nothing to show yet.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
