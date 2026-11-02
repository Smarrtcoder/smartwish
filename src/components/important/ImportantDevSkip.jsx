import { motion } from "framer-motion";

export default function ImportantDevSkip({ onSkip }) {
  return (
    <motion.div className="group relative inline-block"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }}>
      <span aria-hidden="true" className="absolute -inset-[2px] rounded-full blur-[5px] opacity-60 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
        style={{ background: "linear-gradient(120deg,#fff3d6,#f5c451,#93c5fd,#f5c451,#fff3d6)" }} />
      <motion.button type="button" onClick={onSkip}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        className="relative cursor-pointer rounded-full px-5 py-2.5 font-body text-xs sm:text-sm tracking-wide text-[#fff3d6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c451]/70"
        style={{
          background: "rgba(20,14,46,0.85)",
          border: "1px solid rgba(245,196,81,0.7)",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12)",
        }}>
        Skip to Next Step (Development Only) →
      </motion.button>
    </motion.div>
  );
}
