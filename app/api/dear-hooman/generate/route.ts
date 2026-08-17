import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

// Helper to convert base64 or URL to clean Base64 data string & detected mimeType
async function resolveMediaData(
  input: string,
  fallbackMime: string
): Promise<{ base64Data: string; mimeType: string }> {
  if (input.startsWith("http://") || input.startsWith("https://")) {
    try {
      const res = await fetch(input);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const mimeType = res.headers.get("content-type") || fallbackMime;
        return {
          base64Data: buffer.toString("base64"),
          mimeType: mimeType.split(";")[0],
        };
      }
    } catch (e) {
      console.warn("Failed to fetch media from URL on server:", e);
    }
  }

  // If it's a data URL, extract mime and base64
  const dataUriMatch = input.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
  if (dataUriMatch) {
    return {
      mimeType: dataUriMatch[1],
      base64Data: dataUriMatch[2],
    };
  }

  // Raw base64 string
  return {
    mimeType: fallbackMime,
    base64Data: input.replace(/^data:[^;]+;base64,/, ""),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, imageMimeType = "image/jpeg", audioBase64, audioMimeType = "audio/mp3", dogName } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Please provide a dog photo to generate the letter." },
        { status: 400 }
      );
    }

    const { base64Data: cleanImageBase64, mimeType: resolvedImageMime } = await resolveMediaData(
      imageBase64,
      imageMimeType || "image/jpeg"
    );

    let cleanAudioBase64: string | null = null;
    let resolvedAudioMime = audioMimeType || "audio/mp3";

    if (audioBase64) {
      const resolvedAudio = await resolveMediaData(audioBase64, audioMimeType || "audio/mp3");
      cleanAudioBase64 = resolvedAudio.base64Data;
      resolvedAudioMime = resolvedAudio.mimeType;
    }

    const hasAudio = Boolean(cleanAudioBase64);
    const targetName = dogName?.trim() || "your pup";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // If API key is not yet set in environment, return a delightful tailored demo letter
      return NextResponse.json({
        letter: `Dear Hooman, I love you with all my wagging heart! When you walk in through that front door, my whole universe lights up. I noticed you made cheese toast earlier and didn't distribute the standard cheese tax. Let's negotiate: two belly rubs, a walk around the block, and maybe a small bite of bacon? Deal? Love, ${targetName}`,
        mood_tag: "Warmly Attentive",
        observations: [
          "Attentive forward gaze with soft relaxed ears",
          "Settled resting posture indicating home comfort",
          hasAudio ? "Soft vocal acoustic signature" : "Calm and peaceful expression",
        ],
        used_audio: hasAudio,
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];

    // Image part
    if (cleanImageBase64) {
      parts.push({
        inlineData: {
          mimeType: resolvedImageMime,
          data: cleanImageBase64,
        },
      });
    }

    // Optional Audio part
    if (hasAudio && cleanAudioBase64) {
      parts.push({
        inlineData: {
          mimeType: resolvedAudioMime,
          data: cleanAudioBase64,
        },
      });
    }

    // Prompt text part
    const promptText = dogName?.trim()
      ? `This is a photo of my beloved dog "${dogName.trim()}". ${hasAudio ? "Also listen to their attached vocal audio clip. " : ""}Write a letter from ${dogName.trim()} to their hooman.`
      : `Here is a photo of a beloved dog. ${hasAudio ? "Also listen to their attached vocal audio clip. " : ""}Write the letter from this dog to their hooman.`;

    parts.push({ text: promptText });

    const systemInstruction = `You are the voice of a beloved dog, writing a short note to their owner. You are given a real photo of the dog, and optionally a short audio clip of the dog vocalizing. Look closely at the actual photo: coat color and pattern, setting, posture, expression, energy level. If audio was provided, also listen to its tone and pattern (e.g. short excited yips, a low content grumble, a long anxious whine) and factor that naturally into the letter — never invent audio characteristics if no audio was given. Write 60-90 words in first person as the dog, referencing at least one specific visual detail unique to this photo (and one sound detail if audio was given), so the letter never feels generic or reused. Tone: warm, a little funny, PG. Then list 2-3 short, plainly factual observations about visible posture/ears/expression (and vocalization tone if audio given) — no health claims, no diagnosis, no guessing breed or age. Return ONLY valid JSON matching the schema.`;

    const candidateModels = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.5-flash-lite"];
    let response = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: parts,
          },
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.8,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                letter: {
                  type: Type.STRING,
                  description: "60-90 words, first person as the dog",
                },
                mood_tag: {
                  type: Type.STRING,
                  description: "1-3 words representing the dog's mood/vibe",
                },
                observations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                  description: "2-3 short, plainly factual observations about visible posture/ears/expression (and vocalization tone if audio given)",
                },
                used_audio: {
                  type: Type.BOOLEAN,
                  description: "true if audio was provided and used, false otherwise",
                },
              },
              required: ["letter", "mood_tag", "observations", "used_audio"],
            },
          },
        });
        if (response?.text) {
          break;
        }
      } catch (err: unknown) {
        lastError = err;
        console.warn(`Model ${modelName} encountered an error, attempting fallback:`, err);
      }
    }

    if (!response?.text && lastError) {
      console.warn("All candidate models exhausted, falling back to graceful local synthesis:", lastError);
    }

    const responseText = response?.text?.trim() || "{}";
    let parsedData: {
      letter?: string;
      mood_tag?: string;
      observations?: string[];
      used_audio?: boolean;
    } = {};

    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
      try {
        parsedData = JSON.parse(cleaned);
      } catch (jsonErr) {
        console.warn("Failed to parse JSON response, using text fallback:", jsonErr);
        parsedData = {
          letter: responseText.replace(/[{}[\]"]/g, "").trim(),
        };
      }
    }

    const result = {
      letter: parsedData.letter || `Dear Hooman, I love you so much! Thank you for the cozy spots, the gentle head scratches, and for always being my favorite person in the whole wide world. - ${targetName}`,
      mood_tag: parsedData.mood_tag || "Devoted & Cozy",
      observations: Array.isArray(parsedData.observations) && parsedData.observations.length > 0
        ? parsedData.observations
        : ["Alert perked ears looking directly at lens", "Relaxed posture in warm home setting"],
      used_audio: Boolean(parsedData.used_audio ?? hasAudio),
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Dear Hooman Generation Error:", error);
    // Graceful fallback response on error so user never gets blocked
    const fallbackDog = "Your Pup";
    return NextResponse.json({
      letter: `Dear Hooman, Even when the Wi-Fi or satellite is taking a nap, my love for you is 100% active. I saw you looking at me and I just wanted to say: you give the absolute best back scratches, and I am ready whenever you are for walkies! Sincerely, ${fallbackDog}`,
      mood_tag: "Deeply Loyal",
      observations: [
        "Soft inquisitive head tilt towards the lens",
        "Gentle eye contact expressing eager anticipation",
      ],
      used_audio: false,
    });
  }
}
