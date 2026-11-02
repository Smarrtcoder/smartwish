import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { GoldButton } from "@/components/important/ImportantShared";

export default function PollConfirmDialog({ label, busy, onConfirm, onCancel }) {
  return createPortal(
    <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#07051a]/75 px-5 backdrop-blur-sm"
      role="presentation" onClick={busy ? undefined : onCancel}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <motion.div role="alertdialog" aria-modal="true" aria-labelledby="poll-confirm-title" aria-describedby="poll-confirm-text"
        className="glass relative w-full max-w-md rounded-[2rem] px-7 py-9 text-center sm:px-9"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: "easeOut" }}>
        <h4 id="poll-confirm-title" className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#fff3d6] leading-[1.2]">
          Are You Sure About Your Choice?
        </h4>
        <p id="poll-confirm-text" className="font-body text-base text-[#e6dcff] leading-[1.5] mt-4">
          Your choice: <span className="text-[#f5c451] font-semibold">{label}</span>
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button type="button" onClick={onCancel} disabled={busy} autoFocus
            className="w-full cursor-pointer rounded-2xl border border-[#f5c451]/40 bg-white/5 px-6 py-4 font-body text-base font-semibold text-[#fff3d6] transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c451]/70 disabled:cursor-not-allowed disabled:opacity-60">
            No, Go Back
          </button>
          <GoldButton type="button" onClick={onConfirm} disabled={busy} className="w-full">
            {busy ? "Saving..." : "Yes, Confirm"}
          </GoldButton>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
