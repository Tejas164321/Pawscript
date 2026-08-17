"use client";

import React from "react";
import { motion } from "motion/react";

interface PawStep {
  id: number;
  x: number; // percentage from left
  y: number; // percentage from top
  rotation: number;
  sizeClass: string;
  delay: number;
}

export function PawWalkTrail() {
  // S-curved trail of larger, high-aesthetic watermark paws walking across the hero header
  const pawSteps: PawStep[] = [
    { id: 1, x: 5, y: 12, rotation: 38, sizeClass: "w-14 h-14 sm:w-20 sm:h-20", delay: 0.1 },
    { id: 2, x: 18, y: 5, rotation: 42, sizeClass: "w-16 h-16 sm:w-24 sm:h-24", delay: 0.35 },
    { id: 3, x: 32, y: 14, rotation: 30, sizeClass: "w-14 h-14 sm:w-22 sm:h-22", delay: 0.6 },
    { id: 4, x: 48, y: 4, rotation: 22, sizeClass: "w-16 h-16 sm:w-26 sm:h-26", delay: 0.85 },
    { id: 5, x: 64, y: 12, rotation: 18, sizeClass: "w-15 h-15 sm:w-22 sm:h-22", delay: 1.1 },
    { id: 6, x: 78, y: 4, rotation: 28, sizeClass: "w-16 h-16 sm:w-24 sm:h-24", delay: 1.35 },
    { id: 7, x: 90, y: 14, rotation: 36, sizeClass: "w-14 h-14 sm:w-20 sm:h-20", delay: 1.6 },
  ];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
    >
      {pawSteps.map((step) => (
        <motion.div
          key={step.id}
          className="absolute text-[#15150E]"
          style={{
            left: `${step.x}%`,
            top: `${step.y}%`,
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: step.rotation - 12 }}
          animate={{
            opacity: [0, 0.2, 0.12, 0.2],
            scale: [0.5, 1.08, 1],
            rotate: step.rotation,
          }}
          transition={{
            delay: step.delay,
            duration: 1.4,
            times: [0, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 4.5,
            ease: "easeOut",
          }}
        >
          <svg
            viewBox="0 0 32 32"
            fill="currentColor"
            className={`${step.sizeClass} drop-shadow-sm`}
          >
            {/* Main Pad */}
            <path d="M16 14c-3.1 0-5.6 2.4-5.6 5.5 0 2.1 1.2 4 2.9 4.9.8.4 1.7.7 2.7.7s1.9-.3 2.7-.7c1.7-.9 2.9-2.8 2.9-4.9 0-3.1-2.5-5.5-5.6-5.5z" />
            {/* 4 Toe beans */}
            <ellipse
              cx="8.5"
              cy="11.5"
              rx="2.4"
              ry="2.9"
              transform="rotate(-20 8.5 11.5)"
            />
            <ellipse
              cx="13.2"
              cy="8"
              rx="2.4"
              ry="3.2"
              transform="rotate(-6 13.2 8)"
            />
            <ellipse
              cx="18.8"
              cy="8"
              rx="2.4"
              ry="3.2"
              transform="rotate(6 18.8 8)"
            />
            <ellipse
              cx="23.5"
              cy="11.5"
              rx="2.4"
              ry="2.9"
              transform="rotate(20 23.5 11.5)"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

interface FooterPawScatterItem {
  id: number;
  x: number; // percentage from left
  y: number; // percentage from top
  rotation: number;
  sizeClass: string;
  delay: number;
  opacityRange: [number, number];
}

export function FooterPawScatter() {
  // Random organic playful patch of paws right above the footer section
  const scatterPaws: FooterPawScatterItem[] = [
    { id: 1, x: 6, y: 22, rotation: -28, sizeClass: "w-12 h-12 sm:w-16 sm:h-16", delay: 0.2, opacityRange: [0.08, 0.18] },
    { id: 2, x: 14, y: 55, rotation: 15, sizeClass: "w-8 h-8 sm:w-12 sm:h-12", delay: 0.5, opacityRange: [0.06, 0.15] },
    { id: 3, x: 22, y: 15, rotation: 35, sizeClass: "w-14 h-14 sm:w-20 sm:h-20", delay: 0.8, opacityRange: [0.1, 0.22] },
    { id: 4, x: 38, y: 60, rotation: -12, sizeClass: "w-10 h-10 sm:w-14 sm:h-14", delay: 1.1, opacityRange: [0.07, 0.16] },
    { id: 5, x: 50, y: 18, rotation: 45, sizeClass: "w-12 h-12 sm:w-18 sm:h-18", delay: 0.4, opacityRange: [0.09, 0.2] },
    { id: 6, x: 63, y: 58, rotation: -32, sizeClass: "w-14 h-14 sm:w-20 sm:h-20", delay: 1.3, opacityRange: [0.1, 0.22] },
    { id: 7, x: 74, y: 20, rotation: 18, sizeClass: "w-9 h-9 sm:w-13 sm:h-13", delay: 0.7, opacityRange: [0.06, 0.15] },
    { id: 8, x: 84, y: 62, rotation: 38, sizeClass: "w-16 h-16 sm:w-22 sm:h-22", delay: 1.5, opacityRange: [0.11, 0.24] },
    { id: 9, x: 92, y: 16, rotation: -15, sizeClass: "w-11 h-11 sm:w-15 sm:h-15", delay: 0.9, opacityRange: [0.08, 0.17] },
  ];

  return (
    <div
      aria-hidden="true"
      className="relative w-full h-32 sm:h-40 overflow-hidden pointer-events-none select-none border-t border-dashed border-[#15150E]/15 bg-[#FCFBF5]/60"
    >
      {scatterPaws.map((paw) => (
        <motion.div
          key={paw.id}
          className="absolute text-[#15150E]"
          style={{
            left: `${paw.x}%`,
            top: `${paw.y}%`,
          }}
          initial={{ opacity: 0, scale: 0.6, rotate: paw.rotation - 10 }}
          animate={{
            opacity: [0, paw.opacityRange[1], paw.opacityRange[0], paw.opacityRange[1]],
            scale: [0.6, 1.06, 1],
            rotate: [paw.rotation - 10, paw.rotation + 4, paw.rotation],
          }}
          transition={{
            delay: paw.delay,
            duration: 1.8,
            repeat: Infinity,
            repeatDelay: 3.5,
            ease: "easeInOut",
          }}
        >
          <svg
            viewBox="0 0 32 32"
            fill="currentColor"
            className={`${paw.sizeClass} drop-shadow-sm`}
          >
            <path d="M16 14c-3.1 0-5.6 2.4-5.6 5.5 0 2.1 1.2 4 2.9 4.9.8.4 1.7.7 2.7.7s1.9-.3 2.7-.7c1.7-.9 2.9-2.8 2.9-4.9 0-3.1-2.5-5.5-5.6-5.5z" />
            <ellipse
              cx="8.5"
              cy="11.5"
              rx="2.4"
              ry="2.9"
              transform="rotate(-20 8.5 11.5)"
            />
            <ellipse
              cx="13.2"
              cy="8"
              rx="2.4"
              ry="3.2"
              transform="rotate(-6 13.2 8)"
            />
            <ellipse
              cx="18.8"
              cy="8"
              rx="2.4"
              ry="3.2"
              transform="rotate(6 18.8 8)"
            />
            <ellipse
              cx="23.5"
              cy="11.5"
              rx="2.4"
              ry="2.9"
              transform="rotate(20 23.5 11.5)"
            />
          </svg>
        </motion.div>
      ))}

      {/* Playful center cue */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-[#57574B]/50 bg-[#FFFFFF]/80 px-3 py-1 rounded-full border border-[#15150E]/10">
          🐾 Paw-printed with love 🐾
        </span>
      </div>
    </div>
  );
}
