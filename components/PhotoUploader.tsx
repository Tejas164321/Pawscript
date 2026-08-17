"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Camera, X, Check, Sparkles } from "lucide-react";
import { SAMPLE_DOGS, DogPreset } from "@/lib/presets";

interface PhotoUploaderProps {
  imageBase64: string | null;
  imagePreviewUrl: string | null;
  selectedPresetId: string | null;
  onImageSelected: (
    base64: string | null,
    previewUrl: string | null,
    mimeType: string | null,
    presetId?: string | null,
    suggestedName?: string
  ) => void;
}

export function PhotoUploader({
  imagePreviewUrl,
  selectedPresetId,
  onImageSelected,
}: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoadingPreset, setIsLoadingPreset] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      onImageSelected(resultStr, resultStr, file.type || "image/jpeg", null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSelectPreset = (preset: DogPreset) => {
    setIsLoadingPreset(true);
    // Pass image URL directly. The server automatically fetches it and converts to base64.
    onImageSelected(preset.imageUrl, preset.imageUrl, "image/jpeg", preset.id, preset.name);
    setTimeout(() => setIsLoadingPreset(false), 200);
  };

  const clearPhoto = () => {
    onImageSelected(null, null, null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Dropzone / Image Preview */}
      {imagePreviewUrl ? (
        <div className="relative bg-[#FFFFFF] border-[2px] border-[#15150E] rounded-[14px] p-3 shadow-[4px_4px_0_#15150E]">
          <div className="relative w-full h-64 sm:h-72 rounded-[10px] overflow-hidden border-[2px] border-[#15150E] bg-[#FCFBF5]">
            <Image
              src={imagePreviewUrl}
              alt="Uploaded Dog"
              fill
              sizes="(max-width: 640px) 100vw, 560px"
              className="object-cover"
              unoptimized={imagePreviewUrl.startsWith("data:")}
              referrerPolicy="no-referrer"
            />

            {/* Clear Button */}
            <button
              type="button"
              id="btn-remove-photo"
              onClick={clearPhoto}
              className="absolute top-3 right-3 bg-[#15150E] hover:bg-[#FFD100] text-[#FFFFFF] hover:text-[#15150E] p-2 rounded-full border-[1.5px] border-[#15150E] transition-colors z-10 cursor-pointer shadow-sm"
              title="Change Photo"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Attached Badge */}
            <div className="absolute bottom-3 left-3 bg-[#15150E] text-[#FFFFFF] font-mono text-xs px-3 py-1 rounded-full border border-[#FFFFFF]/20 flex items-center gap-1.5 shadow-md">
              <Check className="w-3.5 h-3.5 text-[#FFD100]" />
              <span>PHOTO READY FOR TRANSLATION</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          id="photo-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-[2px] border-dashed border-[#15150E] rounded-[14px] p-6 sm:p-8 text-center transition-all cursor-pointer bg-[#FFFFFF] ${
            isDragging
              ? "bg-[#FFF6CC] -translate-y-1 shadow-[4px_4px_0_#15150E]"
              : "hover:bg-[#FFF6CC] hover:-translate-y-0.5"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="text-4xl select-none" aria-hidden="true">
              🐾
            </div>

            <div>
              <p className="font-display font-bold text-base sm:text-lg text-[#15150E]">
                Drop a dog photo here, or click to choose one
              </p>
              <p className="font-mono text-xs text-[#57574B] mt-1">
                JPG or PNG · analyzed with multimodal vision
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                id="btn-take-photo"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#15150E] bg-[#FFFFFF] hover:bg-[#FFD100] px-3.5 py-1.5 rounded-full border-[1.5px] border-[#15150E] shadow-[2px_2px_0_#15150E] transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Camera</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Dogs */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="font-mono text-xs font-bold text-[#15150E] flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#15150E]" />
            <span>Or test with a sample pup:</span>
          </p>
          {isLoadingPreset && (
            <span className="font-mono text-xs text-[#15150E] animate-pulse">
              Loading pup…
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_DOGS.map((dog) => {
            const isSelected = selectedPresetId === dog.id;
            return (
              <button
                key={dog.id}
                type="button"
                onClick={() => handleSelectPreset(dog)}
                className={`relative group text-left p-2 rounded-[12px] border-[2px] border-[#15150E] transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FFD100] shadow-[3px_3px_0_#15150E] -translate-y-0.5"
                    : "bg-[#FFFFFF] hover:bg-[#FFF6CC] hover:-translate-y-0.5"
                }`}
              >
                <div className="relative w-full h-16 rounded-[8px] overflow-hidden mb-1.5 border-[1.5px] border-[#15150E] bg-[#FCFBF5]">
                  <Image
                    src={dog.imageUrl}
                    alt={dog.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 140px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#FFD100]/40 flex items-center justify-center">
                      <div className="bg-[#15150E] text-[#FFFFFF] p-1 rounded-full">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </div>
                <p className="font-display font-bold text-xs text-[#15150E] truncate">
                  {dog.name}
                </p>
                <p className="font-mono text-[10px] text-[#57574B] truncate">
                  {dog.breed}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
