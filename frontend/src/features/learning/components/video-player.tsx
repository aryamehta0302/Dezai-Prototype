"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { Play, Pause, Volume2, Maximize, SkipForward } from "lucide-react";
import { Progress } from "@/shared/ui/progress";

interface VideoPlayerProps {
  title: string;
  duration: number; // minutes
  className?: string;
}

export function VideoPlayer({ title, duration, className }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 100;
          }
          return p + 2;
        });
      }, 500);
    }
  };

  return (
    <div className={cn("relative rounded-xl overflow-hidden bg-[#0a0a0a]", className)}>
      {/* Video Area */}
      <div className="aspect-video flex items-center justify-center relative">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

        {/* Play Button */}
        <button
          onClick={togglePlay}
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
        >
          {isPlaying ? (
            <Pause className="h-7 w-7 text-white" />
          ) : (
            <Play className="h-7 w-7 text-white ml-1" />
          )}
        </button>

        {/* Title Overlay */}
        {!isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 video-gradient-overlay p-6">
            <p className="text-white font-medium text-sm">{title}</p>
            <p className="text-white/60 text-xs mt-1">{duration} min</p>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-[#111] px-4 py-3 space-y-2">
        <Progress value={progress} className="h-1" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white/70 hover:text-white transition-colors">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button className="text-white/70 hover:text-white transition-colors">
              <SkipForward className="h-4 w-4" />
            </button>
            <button className="text-white/70 hover:text-white transition-colors">
              <Volume2 className="h-4 w-4" />
            </button>
            <span className="text-xs text-white/50">
              {Math.round((progress / 100) * duration)}:00 / {duration}:00
            </span>
          </div>
          <button className="text-white/70 hover:text-white transition-colors">
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
