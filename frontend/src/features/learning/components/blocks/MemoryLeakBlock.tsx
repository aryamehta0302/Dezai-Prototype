"use client";

import { motion, useReducedMotion } from "framer-motion";

interface MemoryLeakBlockProps {
  content: string;
}

export default function MemoryLeakBlock({ content }: MemoryLeakBlockProps) {
  const shouldReduceMotion = useReducedMotion();

  // Split content into characters for individual dripping/fading
  const characters = Array.from(content);

  // Animation variants for individual characters
  const charVariants = {
    hidden: { opacity: 1, y: 0, filter: "blur(0px)" },
    visible: (customIndex: number) => ({
      opacity: [1, 0.9, 0.4, 0],
      y: [0, 10, 30, 60],
      filter: ["blur(0px)", "blur(1px)", "blur(3px)", "blur(6px)"],
      transition: {
        duration: 4,
        repeat: Infinity,
        delay: customIndex * 0.12,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  if (shouldReduceMotion) {
    return (
      <div className="my-6 p-5 rounded-2xl bg-red-950/20 border border-red-500/20 text-red-100 font-mono text-sm leading-relaxed">
        {content}
      </div>
    );
  }

  return (
    <div className="my-6 p-5 rounded-2xl bg-[#0a0404] border border-red-950 shadow-inner relative overflow-hidden min-h-[120px] flex items-center justify-center">
      {/* Background Matrix/Drip Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-transparent to-transparent pointer-events-none" />

      {/* Dripping Text Wrapper */}
      <div className="relative font-mono text-sm text-red-200/90 leading-relaxed text-center break-words max-w-full px-4 select-none">
        {characters.map((char, index) => {
          // Keep spaces as-is to preserve layout, only animate non-space characters
          if (char === " ") {
            return <span key={index}> </span>;
          }
          if (char === "\n") {
            return <br key={index} />;
          }

          return (
            <motion.span
              key={index}
              custom={index}
              variants={charVariants}
              initial="hidden"
              animate="visible"
              className="inline-block origin-bottom text-red-400 font-semibold"
            >
              {char}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
