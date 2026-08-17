"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { PhotoUploader } from "@/components/PhotoUploader";
import { AudioInput } from "@/components/AudioInput";
import { PawProgressMeter } from "@/components/PawProgressMeter";
import { LetterCard, LetterResult } from "@/components/LetterCard";
import { PawWalkTrail, FooterPawScatter } from "@/components/PawWalkTrail";

export default function PawscriptApp() {
  const [dogName, setDogName] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>("image/jpeg");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isReGenerating, setIsReGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<LetterResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageSelected = (
    base64: string | null,
    previewUrl: string | null,
    mimeType: string | null,
    presetId?: string | null,
    suggestedName?: string
  ) => {
    setImageBase64(base64);
    setImagePreviewUrl(previewUrl);
    setImageMimeType(mimeType || "image/jpeg");
    setSelectedPresetId(presetId || null);
    if (suggestedName && !dogName) {
      setDogName(suggestedName);
    }
  };

  const handleAudioChange = (
    base64: string | null,
    mimeType: string | null,
    name: string | null
  ) => {
    setAudioBase64(base64);
    setAudioMimeType(mimeType);
    setAudioName(name);
  };

  const handleGenerate = async (isReRun = false) => {
    if (!imageBase64) {
      setErrorMessage("Please upload or select a dog photo first!");
      return;
    }

    setErrorMessage(null);
    if (isReRun) {
      setIsReGenerating(true);
    } else {
      setIsGenerating(true);
    }

    try {
      const response = await fetch("/api/dear-hooman/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64,
          imageMimeType: imageMimeType || "image/jpeg",
          audioBase64: audioBase64,
          audioMimeType: audioMimeType || "audio/mp3",
          dogName: dogName.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate letter. Please try again.");
      }

      setResult({
        letter: data.letter,
        mood_tag: data.mood_tag,
        observations: data.observations || [],
        used_audio: Boolean(data.used_audio),
      });

      // Smooth scroll gently to letter card area if user scrolled down
      const cardEl = document.getElementById("main-pawscript-card");
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err: unknown) {
      console.error("Generation Error:", err);
      const msg = err instanceof Error ? err.message : "Something went wrong while connecting with Gemini.";
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
      setIsReGenerating(false);
    }
  };

  const handleUploadNew = () => {
    setResult(null);
    setImageBase64(null);
    setImagePreviewUrl(null);
    setSelectedPresetId(null);
    setAudioBase64(null);
    setAudioMimeType(null);
    setAudioName(null);
    setDogName("");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#15150E] flex flex-col justify-between selection:bg-[#FFD100]">
      <main className="w-full">
        {/* Hero Section */}
        <header className="relative text-center pt-12 sm:pt-16 pb-8 px-4 bg-[#FFFFFF] overflow-hidden">
          {/* Subtle Watermark Paw Walk Trail Animation */}
          <PawWalkTrail />

          <div className="relative max-w-[900px] mx-auto z-10">
            <span className="font-mono text-xs tracking-wider uppercase text-[#15150E] inline-flex items-center gap-2 bg-[#FFD100] px-3.5 py-1.5 rounded-full border-[1.5px] border-[#15150E] font-bold shadow-[2px_2px_0_#15150E]">
              ● PAWSCRIPT — THE CANINE LETTER WRITER
            </span>

            <h1 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl mt-5 leading-[1.1] max-w-[20ch] mx-auto tracking-tight">
              An AI That Speaks Dog.<br />
              They Have A Few{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 text-[#15150E]">Things To Say.</span>
                {/* Hand-Drawn Animated Pencil Sketch Underline */}
                <svg
                  className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4 text-[#15150E] -z-0 pointer-events-none overflow-visible"
                  viewBox="0 0 250 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M3 13C60 4 160 3 247 11"
                    stroke="#FFD100"
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity="0.9"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M4 14C65 5 165 4 246 12"
                    stroke="#15150E"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.35, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M18 16C80 8 190 7 236 15"
                    stroke="#15150E"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    opacity="0.7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  />
                </svg>
              </span>
            </h1>

            <p className="font-body text-base sm:text-lg text-[#57574B] max-w-[54ch] mx-auto mt-5 leading-relaxed">
              Upload a photo of your pup. Gemini Multimodal Vision reads their expression, posture, and cues — then drafts a letter in their true voice.
            </p>

            {/* Error Notification */}
            {errorMessage && (
              <div className="max-w-[560px] mx-auto mt-6 p-4 bg-[#FFF6CC] border-[2px] border-[#15150E] rounded-[14px] flex items-start gap-3 text-[#15150E] shadow-[4px_4px_0_#15150E] text-left">
                <AlertCircle className="w-5 h-5 text-[#15150E] shrink-0 mt-0.5" />
                <div className="flex-1 font-mono text-xs">
                  <p className="font-bold uppercase tracking-wide">Paw-don us!</p>
                  <p className="mt-0.5">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="font-mono text-xs font-bold underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Main Central Scanner / Letter Box */}
            <div
              id="main-pawscript-card"
              className="mt-8 mx-auto max-w-[560px] bg-[#FFD100] border-[2.5px] border-[#15150E] rounded-[22px] p-5 sm:p-7 shadow-[8px_8px_0_#15150E] text-left"
            >
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  /* Progress Meter View with Photo Preview & Glowing Paw Bar */
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                  >
                    <PawProgressMeter
                      hasAudio={Boolean(audioBase64)}
                      isGenerating={isGenerating}
                      dogName={dogName}
                      imagePreviewUrl={imagePreviewUrl}
                    />
                  </motion.div>
                ) : result && imagePreviewUrl ? (
                  /* Result Screen View */
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <LetterCard
                      result={result}
                      imagePreviewUrl={imagePreviewUrl}
                      dogName={dogName}
                      onWriteAnother={() => handleGenerate(true)}
                      onUploadNew={handleUploadNew}
                      isReGenerating={isReGenerating}
                    />
                  </motion.div>
                ) : (
                  /* Input Box Form */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Dog Name input */}
                    <div className="bg-[#FFFFFF] border-[2px] border-[#15150E] rounded-[14px] p-4 shadow-[4px_4px_0_#15150E]">
                      <label
                        htmlFor="input-dog-name"
                        className="block font-mono text-xs font-bold uppercase tracking-wider text-[#15150E] mb-1.5"
                      >
                        Pup&apos;s Name (Optional)
                      </label>
                      <input
                        id="input-dog-name"
                        type="text"
                        placeholder="e.g. Barnaby, Milo, Charlie, Luna..."
                        value={dogName}
                        onChange={(e) => setDogName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-[8px] bg-[#FCFBF5] border-[1.5px] border-[#15150E] text-[#15150E] font-body text-sm placeholder:text-[#8C8C7C] focus:outline-none focus:bg-[#FFFFFF]"
                        maxLength={40}
                      />
                    </div>

                    {/* Photo Uploader */}
                    <PhotoUploader
                      imageBase64={imageBase64}
                      imagePreviewUrl={imagePreviewUrl}
                      selectedPresetId={selectedPresetId}
                      onImageSelected={handleImageSelected}
                    />

                    {/* Audio Vocalization Input */}
                    <AudioInput
                      audioBase64={audioBase64}
                      audioMimeType={audioMimeType}
                      audioName={audioName}
                      onAudioChange={handleAudioChange}
                    />

                    {/* Action Submit Button */}
                    <button
                      id="btn-generate-letter"
                      type="button"
                      onClick={() => handleGenerate(false)}
                      disabled={!imageBase64 || isGenerating}
                      className={`w-full py-3.5 px-6 rounded-full font-mono text-sm sm:text-base font-bold flex items-center justify-center gap-2 border-[2.5px] border-[#15150E] transition-all ${
                        imageBase64
                          ? "bg-[#15150E] text-[#FFFFFF] hover:bg-[#57574B] shadow-[4px_4px_0_#FFFFFF] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                          : "bg-[#FFFFFF]/50 text-[#15150E]/40 border-[#15150E]/30 cursor-not-allowed shadow-none"
                      }`}
                    >
                      <span>Write My Dog&apos;s Letter</span>
                      <span className="text-xl">🐾</span>
                    </button>

                    {/* Status Line */}
                    <p className="font-mono text-xs font-semibold text-[#15150E] text-center pt-1">
                      {imageBase64
                        ? "Photo ready. Click above to translate."
                        : "Ready. Drop a photo or choose a sample pup above."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* How It Works Section */}
        <section className="py-16 px-4 bg-[#FFFFFF]" id="how">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center">
              <span className="font-mono text-xs tracking-wider uppercase text-[#15150E] inline-flex items-center gap-2 bg-[#FFD100] px-3.5 py-1.5 rounded-full border-[1.5px] border-[#15150E] font-bold shadow-[2px_2px_0_#15150E]">
                ● How It Works
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
              <div className="bg-[#FFFFFF] border-[2px] border-[#15150E] rounded-[14px] p-5 shadow-[4px_4px_0_#15150E] transition-transform hover:-translate-y-1">
                <span className="font-mono text-xs font-bold text-[#15150E] bg-[#FFD100] inline-block px-2 py-0.5 rounded-[4px] border-[1.5px] border-[#15150E]">
                  01
                </span>
                <h3 className="font-display font-bold text-lg text-[#15150E] mt-3">
                  Visual &amp; Posture Reading
                </h3>
                <p className="font-body text-sm text-[#57574B] mt-2 leading-relaxed">
                  Gemini multimodal vision inspects your dog&apos;s expression, ear tilt, coat condition, and surroundings to determine true canine mood.
                </p>
              </div>

              <div className="bg-[#FFFFFF] border-[2px] border-[#15150E] rounded-[14px] p-5 shadow-[4px_4px_0_#15150E] transition-transform hover:-translate-y-1">
                <span className="font-mono text-xs font-bold text-[#15150E] bg-[#FFD100] inline-block px-2 py-0.5 rounded-[4px] border-[1.5px] border-[#15150E]">
                  02
                </span>
                <h3 className="font-display font-bold text-lg text-[#15150E] mt-3">
                  Tone &amp; Acoustic Sensing
                </h3>
                <p className="font-body text-sm text-[#57574B] mt-2 leading-relaxed">
                  Optional barks, whines, or sleepy yawns are analyzed alongside the image to tune the letter&apos;s emotional urgency and rhythm.
                </p>
              </div>

              <div className="bg-[#FFFFFF] border-[2px] border-[#15150E] rounded-[14px] p-5 shadow-[4px_4px_0_#15150E] transition-transform hover:-translate-y-1">
                <span className="font-mono text-xs font-bold text-[#15150E] bg-[#FFD100] inline-block px-2 py-0.5 rounded-[4px] border-[1.5px] border-[#15150E]">
                  03
                </span>
                <h3 className="font-display font-bold text-lg text-[#15150E] mt-3">
                  First-Person Dog Voice
                </h3>
                <p className="font-body text-sm text-[#57574B] mt-2 leading-relaxed">
                  Drafts a heartfelt 60–90 word letter written directly from your pup to you, accompanied by factual Tail Tell visual cues.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center space-y-2">
              <p className="font-body text-sm font-medium text-[#15150E] max-w-[62ch] mx-auto">
                🐾 Every letter is written fresh from your photo — try the same pup twice and you&apos;ll get a different one.
              </p>
              <p className="font-body text-xs text-[#57574B] max-w-[62ch] mx-auto leading-relaxed">
                Photos and audio are sent directly to Gemini for analysis and are not stored.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Playful Footer Paw Scatter Watermark */}
      <FooterPawScatter />

      {/* Footer */}
      <footer className="border-t-[2.5px] border-[#15150E] py-6 text-center bg-[#FCFBF5]">
        <div className="max-w-[900px] mx-auto px-4 font-mono text-xs text-[#57574B]">
          Built with Gemini Multimodal AI ·{" "}
          <span className="font-bold text-[#15150E]">#Pawscript</span> · Tail wags included
        </div>
      </footer>
    </div>
  );
}
