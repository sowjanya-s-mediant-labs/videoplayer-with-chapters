import type { VideoMetadata, Chapter, Topic, SubChapter } from "../types/video";

// Reads video metadata at runtime from a JSON file hosted under `public/metadata/<videoId>.json`.
// Falls back to a default shape if the file is missing or invalid.
export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  // Build the URL from an optional base (configured at build time) or default to same-origin
  // Default to relative path so file:// double-click can work after build.
  // For hosted deployments, you can set VITE_METADATA_BASE to an absolute path or URL.
  const base = (import.meta as any)?.env?.VITE_METADATA_BASE?.toString?.() || "./metadata";
  const url = `${base}/${encodeURIComponent(videoId)}.json`;

  try {
    // Add a cache-busting query when you want the freshest JSON after deploys
    const res = await fetch(`${url}?ts=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load metadata: ${res.status}`);
    const raw = (await res.json()) as VideoMetadata;

    // Basic shape validation (allow topics-only): require id and manifestUrl
    if (!raw || !raw.videoId || !raw.manifestUrl) {
      throw new Error("Invalid metadata shape");
    }

    // Set up base paths
    const thumbnailsBase = (raw as any).thumbnailsBase || `./thumbnails/${raw.videoId}`;

    // Enrich topics (if present)
    let topicsWithThumbs: Topic[] | undefined = undefined;
    if ((raw as any).topics && Array.isArray((raw as any).topics)) {
      const rawTopics = (raw as any).topics as Topic[];
      topicsWithThumbs = rawTopics.map((t, ti) => {
        const subs: SubChapter[] = (t.subchapters || []).map((sc, si) => {
          const subId = sc.id || `${t.id || ti + 1}-${si + 1}`;
          const inferredSub = `${thumbnailsBase}/${subId}.jpg`;
          return {
            ...sc,
            id: subId,
            thumbnail: sc.thumbnail || inferredSub,
          };
        });
        return { id: t.id || String(ti + 1), title: t.title, subchapters: subs } as Topic;
      });
    }

    // Enrich/derive chapters
    let chaptersWithThumbs: Chapter[] = [];
    if (Array.isArray(raw.chapters) && raw.chapters.length > 0) {
      chaptersWithThumbs = raw.chapters.map((ch, idx) => {
        const chapterId = ch.id || String(idx + 1);
        const inferred = `${thumbnailsBase}/${chapterId}.jpg`;
        return {
          ...ch,
          id: chapterId,
          thumbnail: ch.thumbnail || inferred,
        };
      });
    } else if (topicsWithThumbs && topicsWithThumbs.length > 0) {
      // Flatten topics.subchapters into chapters when chapters are omitted
      chaptersWithThumbs = topicsWithThumbs.flatMap((t) =>
        (t.subchapters || []).map((sc) => ({
          id: sc.id,
          title: sc.title,
          start: sc.start,
          end: sc.end,
          thumbnail: sc.thumbnail,
        } as Chapter))
      );
    } else {
      // Neither chapters nor topics present
      throw new Error("Invalid metadata: requires chapters or topics");
    }

    const data: VideoMetadata = {
      ...raw,
      chapters: chaptersWithThumbs,
      topics: topicsWithThumbs,
    };

    return data;
  } catch (_err) {
    // Fallback to a sensible default so the app still works in dev or when file is missing
    return {
      videoId,
      duration: 1_800_000,
      title: "Sample Video",
      manifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      chapters: [
        { id: "1", title: "Introduction", start: 0 },
        { id: "2", title: "Setup & Requirements", start: 120_000 },
        { id: "3", title: "Core Concepts", start: 420_000 },
        { id: "4", title: "Demo Walkthrough", start: 780_000 },
        { id: "5", title: "Wrap Up", start: 1_500_000 },
      ],
    };
  }
}
