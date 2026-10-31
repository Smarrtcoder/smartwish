import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
import { PERSONAL_PAGE } from "@/data-important";
import { ImportantShell, StarField } from "@/components/important/ImportantShared";

const REVEAL = { initial: { opacity: 0, y: 50 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.25 } };

function PersonalBackdrop({ scrollYProgress }) {
  const slowY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const fastY = useTransform(scrollYProgress, [0, 1], [0, -260]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true"
      style={{ background: "radial-gradient(60% 45% at 18% 12%, rgba(244,182,200,0.28), transparent 70%), radial-gradient(55% 50% at 88% 45%, rgba(245,196,81,0.16), transparent 70%), radial-gradient(70% 55% at 20% 90%, rgba(185,164,255,0.28), transparent 70%), linear-gradient(175deg, #0a0f2c 0%, #1b1640 35%, #3b2a5c 68%, #5e4568 100%)" }}>
      <StarField count={90} />
      <motion.div className="absolute -top-20 left-[-10%] w-[420px] h-[260px] rounded-full blur-3xl"
        style={{ y: slowY, background: "radial-gradient(circle, rgba(244,182,200,0.35), transparent 70%)" }}
        animate={{ x: [0, 60, 0] }} transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-[38%] right-[-12%] w-[480px] h-[300px] rounded-full blur-3xl"
        style={{ y: fastY, background: "radial-gradient(circle, rgba(245,196,81,0.2), transparent 70%)" }}
        animate={{ x: [0, -50, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-[-6%] left-[10%] w-[520px] h-[280px] rounded-full blur-3xl"
        style={{ y: slowY, background: "radial-gradient(circle, rgba(185,164,255,0.3), transparent 70%)" }}
        animate={{ x: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-full"
        style={{ background: "linear-gradient(180deg, rgba(255,240,210,0.09), transparent 65%)" }}
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

function FlourishDivider() {
  return (
    <motion.div className="my-14 flex w-full items-center gap-4"
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }}>
      <motion.span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#f5c451]/70"
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: "easeOut" }}
        style={{ transformOrigin: "right" }} />
      <motion.span animate={{ rotate: [0, 12, 0], scale: [1, 1.12, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <Sparkles size={18} color="#f5c451" />
      </motion.span>
      <motion.span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#f5c451]/70"
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: "easeOut" }}
        style={{ transformOrigin: "left" }} />
    </motion.div>
  );
}

function GlassMessage({ children }) {
  return (
    <motion.div className="relative w-full" {...REVEAL} transition={{ duration: 1.2, ease: "easeOut" }}>
      <motion.div className="absolute -inset-3 rounded-[2.5rem] blur-2xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(244,182,200,0.25), rgba(185,164,255,0.18) 50%, transparent 75%)" }}
        animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="relative rounded-[2.5rem] px-7 py-10 sm:px-12 sm:py-14"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))",
          backdropFilter: "blur(16px) saturate(120%)",
          WebkitBackdropFilter: "blur(16px) saturate(120%)",
          border: "1px solid rgba(255,230,200,0.22)",
          boxShadow: "0 0 50px rgba(244,182,200,0.15), 0 24px 60px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.18)",
        }}
        animate={{ y: [0, -6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function PhotoFrame({ photo }) {
  return (
    <motion.figure className="w-full" {...REVEAL} transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}>
      <div className="relative aspect-[4/5] sm:aspect-[4/3] overflow-hidden rounded-[2rem] border border-[#f5c451]/30"
        style={{ boxShadow: "0 0 40px rgba(245,196,81,0.18), 0 20px 50px rgba(0,0,0,0.35)", background: "rgba(20,14,46,0.5)" }}>
        {photo.src ? (
          <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="font-body text-xs uppercase tracking-[0.25em] text-[#e8c96b]">Your photograph</span>
            <span className="font-hand text-xl text-[#f5c451]">[Add a photo here]</span>
          </div>
        )}
      </div>
      {photo.caption && <figcaption className="font-hand text-xl text-center text-[#f5c451] mt-3">{photo.caption}</figcaption>}
    </motion.figure>
  );
}

export default function ImportantPersonalPage({ onClose }) {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const { opening, mainMessage, sections, closing } = PERSONAL_PAGE;

  return (
    <ImportantShell label="Personal message" onClose={onClose}
      scrollRef={scrollRef} backdrop={<PersonalBackdrop scrollYProgress={scrollYProgress} />}>
      <motion.div className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-28 sm:px-10"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, ease: "easeOut" }}>
        <motion.p className="font-body text-sm uppercase tracking-[0.3em] text-[#e8c96b] text-center"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.2 }}>
          {opening.eyebrow}
        </motion.p>
        <motion.h2 className="font-serif-display text-4xl sm:text-6xl font-bold text-[#fff3d6] text-center leading-[1.2] mt-4"
          style={{ textShadow: "0 0 30px rgba(245,196,81,0.35)" }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 1.6, ease: "easeOut" }}>
          {opening.heading}
        </motion.h2>

        <FlourishDivider />

        <GlassMessage>
          <h3 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#fff3d6] leading-[1.2] text-center">
            {mainMessage.title}
          </h3>
          <div className="mt-6 flex flex-col gap-5">
            {mainMessage.paragraphs.map((p, i) => (
              <p key={i} className="font-body text-base sm:text-lg text-[#e6dcff] leading-[1.5]">{p}</p>
            ))}
          </div>
          <p className="font-hand text-2xl sm:text-3xl text-[#f5c451] gold-glow text-right mt-8">{mainMessage.signature}</p>
        </GlassMessage>

        {sections.map((section, i) => (
          <div key={i} className="flex w-full flex-col items-center">
            <FlourishDivider />
            <GlassMessage>
              <h3 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#fff3d6] leading-[1.2]">{section.title}</h3>
              <div className="mt-5 flex flex-col gap-4">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="font-body text-base sm:text-lg text-[#e6dcff] leading-[1.5]">{p}</p>
                ))}
              </div>
            </GlassMessage>
            {section.photo && <div className="mt-10 w-full max-w-md"><PhotoFrame photo={section.photo} /></div>}
          </div>
        ))}

        <FlourishDivider />
        <motion.p className="font-hand text-3xl sm:text-4xl text-[#f5c451] gold-glow text-center" {...REVEAL}
          transition={{ duration: 1.4, ease: "easeOut" }}>
          {closing}
        </motion.p>
      </motion.div>
    </ImportantShell>
  );
}
