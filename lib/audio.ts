// Utility for audio recording and playback

export async function playAudioFromBase64(base64Data: string, mimeType: string): Promise<HTMLAudioElement | AudioBufferSourceNode> {
  if (mimeType.includes("pcm")) {
    // 24kHz raw PCM for Gemini TTS
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
      sampleRate: 24000,
    });
    const buffer = audioCtx.createBuffer(1, int16Array.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < int16Array.length; i++) {
      channelData[i] = int16Array[i] / 32768.0;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
    return source;
  } else {
    // MP3/WAV/AAC blob playback
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
    return audio;
  }
}

export function speakWithWebSpeech(
  text: string,
  onEnd?: () => void,
  onError?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onError?.();
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95; // slightly relaxed dog pace
  utterance.pitch = 1.1; // warm and slightly expressive

  // Try to pick an English voice
  const voices = window.speechSynthesis.getVoices();
  const warmVoice = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.includes("Natural") ||
        v.name.includes("Samantha") ||
        v.name.includes("Daniel") ||
        v.name.includes("Google") ||
        v.name.includes("Fred"))
  ) || voices.find((v) => v.lang.startsWith("en"));

  if (warmVoice) {
    utterance.voice = warmVoice;
  }

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = () => {
    onError?.();
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}
