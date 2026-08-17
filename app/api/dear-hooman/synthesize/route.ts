import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";

export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text to synthesize" }, { status: 400 });
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

    // 1. Try ElevenLabs if configured
    if (elevenLabsApiKey && elevenLabsApiKey !== "MY_ELEVENLABS_API_KEY") {
      try {
        const elevenResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": elevenLabsApiKey,
              Accept: "audio/mpeg",
            },
            body: JSON.stringify({
              text: text,
              model_id: "eleven_turbo_v2_5",
              voice_settings: {
                stability: 0.65,
                similarity_boost: 0.8,
                style: 0.25,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (elevenResponse.ok) {
          const arrayBuffer = await elevenResponse.arrayBuffer();
          const base64Audio = Buffer.from(arrayBuffer).toString("base64");
          return NextResponse.json({
            audioBase64: base64Audio,
            mimeType: "audio/mpeg",
            source: "elevenlabs",
          });
        } else {
          console.warn("ElevenLabs returned error:", elevenResponse.status, await elevenResponse.text());
        }
      } catch (e) {
        console.warn("ElevenLabs synthesis failed, checking fallbacks:", e);
      }
    }

    // 2. Try Gemini TTS fallback if GEMINI_API_KEY is available
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiApiKey,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } },
        });

        const ttsResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: `Say warmly and cheerfully in a lovable dog voice: ${text}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Puck" },
              },
            },
          },
        });

        const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
          return NextResponse.json({
            audioBase64: audioData,
            mimeType: "audio/pcm;rate=24000",
            source: "gemini_tts",
          });
        }
      } catch (geminiError) {
        console.warn("Gemini TTS fallback not available:", geminiError);
      }
    }

    // 3. Graceful fallback signal for client-side Web Speech Synthesis
    return NextResponse.json({
      audioBase64: null,
      fallbackToWebSpeech: true,
      message: "Direct synthesis API not active, falling back to local speech synthesis.",
    });
  } catch (err: unknown) {
    console.error("Synthesize route error:", err);
    // Never fail hard - return fallback indicator
    return NextResponse.json({
      audioBase64: null,
      fallbackToWebSpeech: true,
    });
  }
}
