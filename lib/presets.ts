export interface DogPreset {
  id: string;
  name: string;
  breed: string;
  tagline: string;
  imageUrl: string;
  soundDescription?: string;
  sampleAudioUrl?: string;
}

export const SAMPLE_DOGS: DogPreset[] = [
  {
    id: "barnaby",
    name: "Barnaby",
    breed: "Golden Retriever",
    tagline: "Sitting in the park grass with a proud goofy grin",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    soundDescription: "Happy soft pant and gentle tail-thump",
  },
  {
    id: "milo",
    name: "Milo",
    breed: "French Bulldog",
    tagline: "Tucked inside a cozy cable-knit blanket watching you cook",
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
    soundDescription: "Low sleepy snort and satisfied sigh",
  },
  {
    id: "luna",
    name: "Luna",
    breed: "Husky Mix",
    tagline: "Head tilted on the living room rug wondering where the ball went",
    imageUrl: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
    soundDescription: "Dramatic mini woo-woo whine",
  },
  {
    id: "waffles",
    name: "Waffles",
    breed: "Corgi",
    tagline: "Looking up intently with big ears waiting for cheese tax",
    imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
    soundDescription: "Short excited yip-bark",
  },
];
