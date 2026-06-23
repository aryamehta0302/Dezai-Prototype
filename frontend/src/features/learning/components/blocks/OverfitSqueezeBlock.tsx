"use client";

import { motion, useReducedMotion } from "framer-motion";

interface OverfitSqueezeBlockProps {
  content: string;
}

export default function OverfitSqueezeBlock({ content }: OverfitSqueezeBlockProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className="my-6 p-5 rounded-lg bg-blue-950/20 border-2 border-blue-500 text-blue-100 font-mono text-sm leading-relaxed">
        {content}
      </div>
    );
  }

  return (
    <div className="my-6 flex items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden min-h-[140px]">
      <motion.div
        animate={{
          maxWidth: ["100%", "60%", "40%", "100%"],
          paddingLeft: ["24px", "8px", "4px", "24px"],
          paddingRight: ["24px", "8px", "4px", "24px"],
          borderColor: ["#1e293b", "#3b82f6", "#ef4444", "#1e293b"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-full border-2 border-dashed p-6 rounded-lg text-center bg-blue-950/5 flex flex-col justify-center items-center shadow-lg"
      >
        <p className="text-sm font-mono text-blue-300 select-none leading-relaxed break-words w-full">
          {content}
        </p>
        <span className="text-[10px] uppercase font-bold text-red-500/70 tracking-widest mt-2 block animate-pulse">
          Overfitting Squeeze
        </span>
      </motion.div>
    </div>
  );
}
