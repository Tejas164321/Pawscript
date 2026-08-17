"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Trash2, UploadCloud, Radio } from "lucide-react";

interface AudioInputProps {
  audioBase64: string | null;
  audioMimeType: string | null;
  audioName: string | null;
  onAudioChange: (base64: string | null, mimeType: string | null, name: string | null) => void;
}

export function AudioInput({
  audioBase64,
  audioName,
  onAudioChange,
}: AudioInputProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [isPlayingBack, setIsPlayingBack] = useState<boolean>(false);
  const [recordError, setRecordError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playbackAudioRef.current) playbackAudioRef.current.pause();
    };
  }, []);

  const startRecording = async () => {
    setRecordError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onAudioChange(base64data, "audio/webm", `Pup Vocalization (${recordSeconds}s)`);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 15) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.error("Mic permission error:", err);
      setRecordError("Microphone access was denied or is unavailable in this environment.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      onAudioChange(base64data, file.type || "audio/mp3", file.name);
    };
    reader.readAsDataURL(file);
  };

  const handlePlayPreview = () => {
    if (!audioBase64) return;
    if (isPlayingBack) {
      if (playbackAudioRef.current) playbackAudioRef.current.pause();
      setIsPlayingBack(false);
      return;
    }

    const audio = new Audio(audioBase64);
    playbackAudioRef.current = audio;
    audio.play();
    setIsPlayingBack(true);
    audio.onended = () => setIsPlayingBack(false);
    audio.onerror = () => setIsPlayingBack(false);
  };

  const clearAudio = () => {
    if (playbackAudioRef.current) playbackAudioRef.current.pause();
    setIsPlayingBack(false);
    onAudioChange(null, null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyPresetAudio = (type: "happy_yips" | "sleepy_snore" | "curious_whine") => {
    try {
      const sampleRate = 22050;
      const duration = 1.2;
      const totalSamples = Math.floor(sampleRate * duration);
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const buffer = audioCtx.createBuffer(1, totalSamples, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        if (type === "happy_yips") {
          data[i] = Math.sin(2 * Math.PI * 650 * t) * Math.exp(-6 * (t % 0.4)) * 0.4;
        } else if (type === "sleepy_snore") {
          data[i] = Math.sin(2 * Math.PI * 110 * t) * (0.3 + 0.1 * Math.sin(2 * Math.PI * 3 * t));
        } else {
          const freq = 450 + 200 * (t / duration);
          data[i] = Math.sin(2 * Math.PI * freq * t) * 0.35 * Math.sin(Math.PI * (t / duration));
        }
      }

      const wavBytes = createWavFile(data, sampleRate);
      const base64 = `data:audio/wav;base64,${btoa(String.fromCharCode(...wavBytes))}`;
      const name =
        type === "happy_yips"
          ? "Excited Tail-Wag Yips"
          : type === "sleepy_snore"
          ? "Sleepy Snore & Grumble"
          : "Curious Head-Tilt Whine";

      onAudioChange(base64, "audio/wav", name);
    } catch (e) {
      console.warn("Preset generation error:", e);
    }
  };

  return (
    <div className="w-full bg-[#FFFFFF] border-[2px] border-[#15150E] rounded-[14px] p-4 shadow-[4px_4px_0_#15150E]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-[#15150E]" />
          <h4 className="font-mono text-xs font-bold text-[#15150E] uppercase tracking-wide">
            Dog Vocalization (Optional)
          </h4>
        </div>
        <span className="font-mono text-[10px] font-bold text-[#15150E] bg-[#FFD100] px-2 py-0.5 rounded-full border border-[#15150E]">
          ACOUSTIC CUES
        </span>
      </div>

      <p className="font-mono text-xs text-[#57574B] mb-3">
        Attach a bark, whine, or sigh to let Gemini analyze tone & sound cues.
      </p>

      {audioBase64 ? (
        /* Active Attached Audio state */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#FCFBF5] border-[2px] border-[#15150E] rounded-[10px]">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePlayPreview}
              className={`p-2 rounded-[8px] border-[1.5px] border-[#15150E] transition-all cursor-pointer ${
                isPlayingBack
                  ? "bg-[#15150E] text-[#FFFFFF]"
                  : "bg-[#FFD100] text-[#15150E] hover:bg-[#E0B400]"
              }`}
              title={isPlayingBack ? "Stop preview" : "Play preview"}
            >
              {isPlayingBack ? (
                <Square className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div className="overflow-hidden">
              <p className="font-display font-bold text-xs text-[#15150E] truncate max-w-[200px]">
                {audioName || "Pup Audio Clip Attached"}
              </p>
              <span className="font-mono text-[10px] text-[#15150E] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15150E] animate-ping" />
                Audio cue synced
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={clearAudio}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 font-mono text-xs text-[#15150E] bg-[#FFFFFF] hover:bg-[#FFD100] px-3 py-1.5 rounded-full border-[1.5px] border-[#15150E] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      ) : isRecording ? (
        /* Active Recording state */
        <div className="p-4 bg-[#FFD100] border-[2px] border-[#15150E] rounded-[10px] flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15150E] animate-ping" />
            <span className="font-mono text-xs font-bold text-[#15150E] uppercase tracking-wide">
              Recording Pup Voice... ({recordSeconds}s / 15s)
            </span>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#FFFFFF] bg-[#15150E] hover:bg-[#57574B] px-4 py-2 rounded-full border border-[#15150E] shadow-[2px_2px_0_#15150E] transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Done Recording</span>
          </button>
        </div>
      ) : (
        /* Audio choice actions */
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-record-pup"
              onClick={startRecording}
              className="inline-flex items-center justify-center gap-2 font-mono text-xs font-bold text-[#15150E] bg-[#FFFFFF] hover:bg-[#FFD100] border-[1.5px] border-[#15150E] p-2.5 rounded-[10px] shadow-[2px_2px_0_#15150E] transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-[#15150E]" />
              <span>Record Live Pup Voice</span>
            </button>

            <label
              htmlFor="audio-file-upload"
              className="inline-flex items-center justify-center gap-2 font-mono text-xs font-bold text-[#15150E] bg-[#FFFFFF] hover:bg-[#FFD100] border-[1.5px] border-[#15150E] p-2.5 rounded-[10px] shadow-[2px_2px_0_#15150E] transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#15150E]" />
              <span>Upload Audio File</span>
              <input
                ref={fileInputRef}
                id="audio-file-upload"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {recordError && (
            <p className="font-mono text-xs text-[#15150E] bg-[#FFF6CC] p-2 rounded-[8px] border border-[#15150E]">
              {recordError}
            </p>
          )}

          {/* Quick preset audio options */}
          <div className="pt-2 border-t border-[#15150E]/15">
            <p className="font-mono text-[11px] text-[#57574B] mb-1.5 font-bold">
              Or test with a sample dog sound:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPresetAudio("happy_yips")}
                className="font-mono text-[11px] font-semibold text-[#15150E] bg-[#FFFFFF] hover:bg-[#FFD100] px-2.5 py-1 rounded-full border-[1.5px] border-[#15150E] transition-colors cursor-pointer"
              >
                🐾 Happy Yips
              </button>
              <button
                type="button"
                onClick={() => applyPresetAudio("sleepy_snore")}
                className="font-mono text-[11px] font-semibold text-[#15150E] bg-[#FFFFFF] hover:bg-[#FFD100] px-2.5 py-1 rounded-full border-[1.5px] border-[#15150E] transition-colors cursor-pointer"
              >
                😴 Sleepy Grumble
              </button>
              <button
                type="button"
                onClick={() => applyPresetAudio("curious_whine")}
                className="font-mono text-[11px] font-semibold text-[#15150E] bg-[#FFFFFF] hover:bg-[#FFD100] px-2.5 py-1 rounded-full border-[1.5px] border-[#15150E] transition-colors cursor-pointer"
              >
                ❓ Curious Whine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function createWavFile(samples: Float32Array, sampleRate: number): Uint8Array {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
