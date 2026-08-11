"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, ArrowRight, Sun, Zap, Coffee, Moon } from "lucide-react";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Only show once per session
    const hasSeen = sessionStorage.getItem("hasSeenWelcomePopup");
    if (!hasSeen) {
      setIsOpen(true);
    }

    // Set initial time to avoid hydration mismatch
    setCurrentTime(new Date());

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("hasSeenWelcomePopup", "true");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Ignite your morning";
    if (hour >= 12 && hour < 17) return "Midday momentum";
    if (hour >= 17 && hour < 22) return "Evening insights";
    return "Late night focus";
  };

  const getSubGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Ready to crush your organizational goals today?";
    if (hour >= 12 && hour < 17) return "Keep the team's momentum going strong.";
    if (hour >= 17 && hour < 22) return "Reviewing another great day of progress.";
    return "Burning the midnight oil, your dedication shows.";
  };

  const getVibeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return <Sun className="w-6 h-6 text-white" />;
    if (hour >= 12 && hour < 17) return <Zap className="w-6 h-6 text-white" />;
    if (hour >= 17 && hour < 22) return <Coffee className="w-6 h-6 text-white" />;
    return <Moon className="w-6 h-6 text-white" />;
  };

  return (
    <AnimatePresence>
      {isOpen && currentTime && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative flex flex-col md:flex-row bg-white rounded-[24px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-200/60 w-full max-w-[700px] overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 md:top-5 md:right-5 z-20 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Content */}
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
              {/* Dynamic Icon */}
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center mb-5 md:mb-6">
                {getVibeIcon()}
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 tracking-tight">
                {getGreeting()}
              </h2>
              <p className="text-slate-500 mb-6 md:mb-8 text-sm md:text-[15px] leading-relaxed">
                {getSubGreeting()}
              </p>

              {/* Time Card */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 flex items-center gap-4 mb-8 max-w-[280px]">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#1a56db]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-0.5">
                    It&apos;s <span className="font-semibold text-[#1a56db]">{formatTime(currentTime)}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDate(currentTime)}
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleClose}
                className="group flex items-center justify-center gap-2 px-8 py-2.5 w-fit rounded-full border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-all shadow-sm"
              >
                Let&apos;s Start
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Illustration */}
            <div className="hidden md:flex w-[45%] bg-white items-center justify-center p-6 relative">
              <div className="relative z-10 w-full h-[320px]">
                <Image
                  src="/popupImage.png"
                  alt="Welcome Illustration"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
