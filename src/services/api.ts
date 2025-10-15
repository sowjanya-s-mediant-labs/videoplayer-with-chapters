import type { VideoMetadata } from "../types/video";


export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  // Simulated backend API call
  await new Promise((r) => setTimeout(r, 500)); // simulate network delay

  return {
    videoId,
    duration: 1800,
    manifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    chapters: [
      { id: "1", title: "Introduction", start: 0 },
      { id: "2", title: "Setup & Requirements", start: 120 },
      { id: "3", title: "Core Concepts", start: 420 },
      { id: "4", title: "Demo Walkthrough", start: 780 },
      { id: "5", title: "Wrap Up", start: 1500 },
    ],
  };
}
