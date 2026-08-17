"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Share2,
  ArrowLeft,
  Radio,
} from "lucide-react";
import { playAudioFromBase64, speakWithWebSpeech } from "@/lib/audio";

export interface LetterResult {
  letter: string;
  mood_tag: string;
  observations: string[];
  used_audio: boolean;
}

interface LetterCardProps {
  result: LetterResult;
  imagePreviewUrl: string;
  dogName?: string;
  onWriteAnother: () => void;
  onUploadNew: () => void;
  isReGenerating: boolean;
}

export function LetterCard({
  result,
  imagePreviewUrl,
  dogName,
  onWriteAnother,
  onUploadNew,
  isReGenerating,
}: LetterCardProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const activeAudioRef = useRef<HTMLAudioElement | AudioBufferSourceNode | SpeechSynthesisUtterance | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const stopAudio = () => {
    if (activeAudioRef.current) {
      if ("pause" in activeAudioRef.current) {
        activeAudioRef.current.pause();
      } else if ("stop" in activeAudioRef.current) {
        try {
          activeAudioRef.current.stop();
        } catch {
          // ignore
        }
      }
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handlePlayLetter = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoadingAudio(true);

    try {
      const response = await fetch("/api/dear-hooman/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: result.letter }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.audioBase64 && data.mimeType) {
          const audioHandle = await playAudioFromBase64(data.audioBase64, data.mimeType);
          activeAudioRef.current = audioHandle;
          setIsPlaying(true);
          setIsLoadingAudio(false);

          if ("onended" in audioHandle) {
            audioHandle.onended = () => {
              setIsPlaying(false);
            };
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Server TTS fallback:", e);
    }

    setIsLoadingAudio(false);
    const utterance = speakWithWebSpeech(
      result.letter,
      () => setIsPlaying(false),
      () => setIsPlaying(false)
    );

    if (utterance) {
      activeAudioRef.current = utterance;
      setIsPlaying(true);
    }
  };

  const handleCopy = async () => {
    const title = dogName?.trim() ? `${dogName.trim()}'s Letter` : "Letter From My Pup";
    const textToCopy = `🐾 ${title} (Mood: ${result.mood_tag}) 🐾\n\n"${result.letter}"\n\nTail Tell Observations:\n${result.observations.map((o) => `• ${o}`).join("\n")}\n\nGenerated with Pawscript 🐶`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    const title = dogName?.trim() ? `Letter from ${dogName.trim()}` : "Letter from my dog";
    const text = `"${result.letter}" - ${dogName || "My pup"} (Mood: ${result.mood_tag})`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
      setShareFeedback("Copied letter to share!");
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  const displayName = dogName?.trim() || "Your Pup";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full space-y-4"
    >
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          id="btn-upload-new-top"
          onClick={onUploadNew}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#15150E] bg-[#FFFFFF] hover:bg-[#FFD100] px-3.5 py-1.5 rounded-full border-[1.5px] border-[#15150E] shadow-[2px_2px_0_#15150E] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Scan another photo</span>
        </button>

        <div className="flex items-center gap-2">
          {result.used_audio && (
            <span className="font-mono text-xs font-bold text-[#15150E] bg-[#FFF6CC] px-2.5 py-1 rounded-full border border-[#15150E] flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#15150E] animate-pulse" />
              Audio Tuned
            </span>
          )}
          <button
            id="btn-share-letter"
            onClick={handleShare}
            className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#15150E] bg-[#FFFFFF] hover:bg-[#FFD100] px-3.5 py-1.5 rounded-full border-[1.5px] border-[#15150E] shadow-[2px_2px_0_#15150E] transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {shareFeedback && (
        <div className="text-center font-mono text-xs font-bold text-[#15150E] bg-[#FFF6CC] py-1.5 px-3 rounded-[8px] border border-[#15150E]">
          {shareFeedback}
        </div>
      )}

      {/* Main Letter Card */}
      <div
        id="dog-letter-card"
        ref={cardRef}
        className="relative bg-[#FFFFFF] border-[2.5px] border-[#15150E] rounded-[22px] p-5 sm:p-7 shadow-[8px_8px_0_#15150E]"
      >
        {/* Header with Photo & Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-5 border-b-[2px] border-[#15150E]">
          {/* Framed Dog Photo */}
          <div className="relative shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[14px] overflow-hidden border-[2.5px] border-[#15150E] bg-[#FCFBF5] shadow-[3px_3px_0_#15150E]">
              <Image
                src={imagePreviewUrl}
                alt={displayName}
                fill
                sizes="(max-width: 640px) 96px, 112px"
                className="object-cover"
                unoptimized={imagePreviewUrl.startsWith("data:")}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#FFD100] text-[#15150E] p-1.5 rounded-full border-[1.5px] border-[#15150E] shadow-[2px_2px_0_#15150E]">
              🐾
            </div>
          </div>

          {/* Title & Mood Tag */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#15150E] tracking-tight">
                Dear Hooman,
              </h2>
              <span
                id="letter-mood-tag"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#FFD100] text-[#15150E] border-[1.5px] border-[#15150E] shadow-[2px_2px_0_#15150E]"
              >
                <Sparkles className="w-3 h-3" />
                {result.mood_tag.toUpperCase()}
              </span>
            </div>

            <p className="font-mono text-xs text-[#57574B]">
              Dictated by {displayName} · Translated with Gemini
            </p>

            {/* Audio Voice Player CTA */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                id="btn-play-letter"
                onClick={handlePlayLetter}
                disabled={isLoadingAudio}
                className={`inline-flex items-center gap-2 font-mono text-xs font-bold px-4 py-2 rounded-full border-[2px] border-[#15150E] shadow-[3px_3px_0_#15150E] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                  isPlaying
                    ? "bg-[#15150E] text-[#FFFFFF]"
                    : "bg-[#FFD100] hover:bg-[#E0B400] text-[#15150E]"
                }`}
              >
                {isLoadingAudio ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing voice...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                    <span>Pause Reading</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Play My Letter 🔊</span>
                  </>
                )}
              </button>

              <span className="font-mono text-[11px] font-bold text-[#15150E] bg-[#FFF6CC] px-2.5 py-1 rounded-full border border-[#15150E] inline-flex items-center gap-1 shadow-sm">
                🎙️ Voiced with ElevenLabs
              </span>

              {isPlaying && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-[#FFF6CC] border border-[#15150E] rounded-full">
                  <span className="w-1.5 h-3 bg-[#15150E] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-4 bg-[#15150E] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-2 bg-[#15150E] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="font-mono text-[10px] font-bold text-[#15150E] ml-1">Speaking</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The Letter Body */}
        <div className="my-5 p-5 bg-[#FCFBF5] border-[2px] border-[#15150E] rounded-[14px] shadow-[3px_3px_0_#15150E]">
          <p
            id="letter-body-text"
            className="font-display font-medium text-base sm:text-lg text-[#15150E] leading-relaxed whitespace-pre-line"
          >
            &ldquo;{result.letter}&rdquo;
          </p>
          <div className="mt-4 flex items-center justify-end font-mono text-xs font-bold text-[#57574B]">
            <span>— With infinite wet noses, {displayName} 🐾</span>
          </div>
        </div>

        {/* Tail Tell Observations Panel */}
        <div
          id="tail-tell-panel"
          className="mt-4 bg-[#FFFFFF] border-[2px] border-[#15150E] rounded-[14px] p-4 shadow-[3px_3px_0_#15150E]"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#15150E] flex items-center gap-1.5">
              <span>🐾</span> Tail Tell Cues
            </h3>
            <span className="font-mono text-[10px] text-[#57574B]">
              Visual &amp; Acoustic Analysis
            </span>
          </div>

          <ul className="space-y-1.5 mb-3">
            {result.observations.map((obs, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-[#15150E] font-medium flex items-start gap-2"
              >
                <span className="font-mono text-xs font-bold text-[#15150E] mt-0.5">•</span>
                <span>{obs}</span>
              </li>
            ))}
          </ul>

          {/* Mandatory One-Line Disclaimer */}
          <div className="pt-2 border-t border-[#15150E]/15">
            <p className="font-mono text-[11px] text-[#57574B] italic">
              Just for fun — not a vet read.
            </p>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t-[2px] border-[#15150E]">
          <button
            id="btn-copy-letter"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 font-mono text-xs font-bold text-[#15150E] bg-[#FFFFFF] hover:bg-[#FFD100] px-4 py-2.5 rounded-full border-[1.5px] border-[#15150E] shadow-[2px_2px_0_#15150E] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#15150E]" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Letter</span>
              </>
            )}
          </button>

          <button
            id="btn-write-another"
            onClick={onWriteAnother}
            disabled={isReGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-mono text-xs font-bold text-[#FFFFFF] bg-[#15150E] hover:bg-[#57574B] px-5 py-2.5 rounded-full border-[2px] border-[#15150E] shadow-[3px_3px_0_#15150E] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isReGenerating ? "animate-spin" : ""}`} />
            <span>{isReGenerating ? "Drafting Fresh Note..." : "Write Me Another Letter"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
