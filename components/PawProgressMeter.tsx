"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Radio } from "lucide-react";

interface PawProgressMeterProps {
  hasAudio: boolean;
  isGenerating: boolean;
  dogName?: string;
  imagePreviewUrl?: string | null;
}

interface WalkingPawStep {
  id: number;
  yOffset: number; // Organic alternating footsteps (staggered slightly up and down)
  angle: number;   // Pointing towards the right (90° is horizontal right)
}

export function PawProgressMeter({
  hasAudio,
  isGenerating,
  dogName,
  imagePreviewUrl,
}: PawProgressMeterProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const stagesWithAudio = [
    { title: "Scanning photo & cues", sub: "Reading expressions & posture", icon: "📸" },
    { title: "Acoustic translation", sub: "Deconstructing vocal tones", icon: "👂" },
    { title: "Sniffing canine thoughts", sub: "Translating to hooman speech", icon: "🐾" },
    { title: "Checking tail & ear signals", sub: "Validating emotional context", icon: "✨" },
    { title: "Inking the letter", sub: "Sealing with wet nose love", icon: "💌" },
  ];

  const stagesWithoutAudio = [
    { title: "Scanning photo & cues", sub: "Reading expressions & posture", icon: "📸" },
    { title: "Sniffing canine thoughts", sub: "Translating clues to dog voice", icon: "🐾" },
    { title: "Checking tail & ear signals", sub: "Observing body language", icon: "✨" },
    { title: "Drafting the letter", sub: "Crafting first-person dog prose", icon: "📝" },
    { title: "Inking the letter", sub: "Sealing with wet nose love", icon: "💌" },
  ];

  const stages = hasAudio ? stagesWithAudio : stagesWithoutAudio;

  // 6 paws walking towards the RIGHT in a natural alternate stride (90° points toes directly right)
  const walkingPaws: WalkingPawStep[] = [
    { id: 0, yOffset: -5, angle: 86 },
    { id: 1, yOffset: 6, angle: 94 },
    { id: 2, yOffset: -6, angle: 88 },
    { id: 3, yOffset: 7, angle: 92 },
    { id: 4, yOffset: -5, angle: 87 },
    { id: 5, yOffset: 6, angle: 93 },
  ];

  // Stage timer text updates
  useEffect(() => {
    if (!isGenerating) return;

    const timer0 = setTimeout(() => setCurrentStep(0), 0);
    const timer1 = setTimeout(() => setCurrentStep(1), 1600);
    const timer2 = setTimeout(() => setCurrentStep(2), 3400);
    const timer3 = setTimeout(() => setCurrentStep(3), 5200);
    const timer4 = setTimeout(() => setCurrentStep(4), 7000);

    return () => {
      clearTimeout(timer0);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isGenerating, hasAudio]);

  // Smooth, minimal step walking cadence
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % walkingPaws.length);
    }, 420);

    return () => clearInterval(interval);
  }, [isGenerating, walkingPaws.length]);

  const pupDisplayName = dogName?.trim() || "Your Pup";

  return (
    <div
      id="paw-progress-container"
      className="w-full bg-[#FFFFFF] border-[2.5px] border-[#15150E] rounded-[22px] p-5 sm:p-6 text-center shadow-[8px_8px_0_#15150E] space-y-4"
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between border-b-[2px] border-[#15150E] pb-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD100] border-[1.5px] border-[#15150E] rounded-full text-xs font-mono font-bold text-[#15150E]">
          <span className="w-2 h-2 rounded-full bg-[#15150E] animate-ping" />
          <span>LISTENING TO {pupDisplayName.toUpperCase()}</span>
        </div>

        {hasAudio && (
          <span className="font-mono text-xs font-bold text-[#15150E] bg-[#FFF6CC] px-2.5 py-1 rounded-full border border-[#15150E] flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#15150E] animate-pulse" />
            Vocal Sync
          </span>
        )}
      </div>

      {/* Cute Framed Polaroid-style Preview Card */}
      {imagePreviewUrl && (
        <div className="relative mx-auto w-full max-w-[220px] bg-[#FCFBF5] border-[2px] border-[#15150E] rounded-[16px] p-2.5 shadow-[4px_4px_0_#15150E]">
          <div className="relative w-full aspect-square rounded-[10px] overflow-hidden border-[2px] border-[#15150E] bg-[#15150E]">
            <Image
              src={imagePreviewUrl}
              alt="Pup being scanned"
              fill
              sizes="(max-width: 640px) 220px, 220px"
              className="object-cover opacity-95"
              unoptimized={imagePreviewUrl.startsWith("data:")}
              referrerPolicy="no-referrer"
            />

            {/* Glowing Laser Scan Beam */}
            <div className="absolute left-0 right-0 h-1 bg-[#FFD100] shadow-[0_0_8px_#FFD100] animate-scan pointer-events-none z-10" />

            {/* Corner Scan Reticles */}
            <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#FFD100] pointer-events-none z-10" />
            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[#FFD100] pointer-events-none z-10" />
            <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-[#FFD100] pointer-events-none z-10" />
            <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#FFD100] pointer-events-none z-10" />
          </div>

          <div className="mt-2 flex items-center justify-between px-1">
            <span className="font-display font-bold text-xs text-[#15150E] truncate">
              {pupDisplayName} 🐾
            </span>
            <span className="font-mono text-[10px] font-bold text-[#15150E] bg-[#FFD100] px-2 py-0.5 rounded-full border border-[#15150E]">
              SCANNING
            </span>
          </div>
        </div>
      )}

      {/* Casual Walking Paws Moving Rightward (Minimal Faint -> Normal -> Faint Wave) */}
      <div className="py-2">
        <div
          id="casual-walking-paws-trail"
          className="relative flex items-center justify-between max-w-[340px] mx-auto h-12 px-2"
        >
          {walkingPaws.map((paw, index) => {
            const isStepping = index === activeStepIndex;
            const isPreviousStep =
              (activeStepIndex - index + walkingPaws.length) % walkingPaws.length === 1;

            return (
              <motion.div
                key={paw.id}
                className="relative flex items-center justify-center cursor-default select-none"
                style={{
                  transform: `translateY(${paw.yOffset}px) rotate(${paw.angle}deg)`,
                }}
                animate={{
                  scale: isStepping ? 1.15 : isPreviousStep ? 1.05 : 0.95,
                  opacity: isStepping ? 0.95 : isPreviousStep ? 0.5 : 0.18,
                  x: isStepping ? 2 : 0,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeInOut",
                }}
              >
                <svg
                  viewBox="0 0 32 32"
                  fill="currentColor"
                  className={`w-6 h-6 transition-colors duration-300 ${
                    isStepping
                      ? "text-[#15150E]"
                      : isPreviousStep
                      ? "text-[#57574B]"
                      : "text-[#8C8C7C]"
                  }`}
                >
                  {/* Main Pad */}
                  <path d="M16 14c-3.1 0-5.6 2.4-5.6 5.5 0 2.1 1.2 4 2.9 4.9.8.4 1.7.7 2.7.7s1.9-.3 2.7-.7c1.7-.9 2.9-2.8 2.9-4.9 0-3.1-2.5-5.5-5.6-5.5z" />
                  {/* 4 Toe beans pointing rightward with 90deg base */}
                  <ellipse cx="8.5" cy="11.5" rx="2.4" ry="2.9" transform="rotate(-20 8.5 11.5)" />
                  <ellipse cx="13.2" cy="8" rx="2.4" ry="3.2" transform="rotate(-6 13.2 8)" />
                  <ellipse cx="18.8" cy="8" rx="2.4" ry="3.2" transform="rotate(6 18.8 8)" />
                  <ellipse cx="23.5" cy="11.5" rx="2.4" ry="2.9" transform="rotate(20 23.5 11.5)" />
                </svg>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Current Stage Description Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 p-3 bg-[#FCFBF5] border-[1.5px] border-[#15150E] rounded-[12px] text-left shadow-[2px_2px_0_#15150E]"
        >
          <span className="text-xl shrink-0">{stages[currentStep]?.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm text-[#15150E] truncate">
              {stages[currentStep]?.title}
            </p>
            <p className="font-mono text-xs text-[#57574B] truncate">
              {stages[currentStep]?.sub}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="font-mono text-[11px] text-[#8C8C7C]">
        Gemini Multimodal · Translating canine body cues in real time
      </p>
    </div>
  );
}
