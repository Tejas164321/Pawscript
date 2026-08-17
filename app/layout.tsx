import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Pawscript — Your Dog’s Letter to You',
  description: 'Upload a photo of your pup and receive a warm, funny letter written in their true voice, powered by Gemini.',
  openGraph: {
    title: 'Pawscript — Your Dog’s Letter to You',
    description: 'Upload a photo of your pup and receive a warm, funny letter written in their true voice, powered by Gemini.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pawscript — Your Dog’s Letter to You',
    description: 'Upload a photo of your pup and receive a warm, funny letter written in their true voice, powered by Gemini.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
