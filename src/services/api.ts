import type { VideoMetadata } from "../types/video";

// Reads video metadata at runtime from a JSON file hosted under `public/metadata/<videoId>.json`.
// Falls back to a default shape if the file is missing or invalid.
export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  // Build the URL from an optional base (configured at build time) or default to same-origin
  const base = (import.meta as any)?.env?.VITE_METADATA_BASE?.toString?.() || "/metadata";
  const url = `${base}/${encodeURIComponent(videoId)}.json`;

  try {
    // Add a cache-busting query when you want the freshest JSON after deploys
    const res = await fetch(`${url}?ts=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load metadata: ${res.status}`);
    const data = (await res.json()) as VideoMetadata;

    // Basic shape validation
    if (!data || !data.videoId || !data.manifestUrl || !Array.isArray(data.chapters)) {
      throw new Error("Invalid metadata shape");
    }

    return data;
  } catch (err) {
    // Fallback to a sensible default so the app still works in dev or when file is missing
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
}
