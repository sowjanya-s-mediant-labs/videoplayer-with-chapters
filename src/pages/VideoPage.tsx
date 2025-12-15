// VideoPage.tsx
import React, { useState } from "react";
import VideoPlayer from "../components/VideoPlayer/VideoPlayer";
import ChapterSidebar from "../components/ChapterSidebar/ChapterSidebar";
import type { Chapter, Topic } from "../types/video";
import { useVideoChapters } from "../hooks/useVideoChapters";

const VideoPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(0);

  // Load metadata (chapters + video URL) at runtime
  // Replace 'demo' with your real videoId and ensure public/metadata/<videoId>.json exists
  const { data, isLoading, isError } = useVideoChapters("demo");
  const topicsFromMeta: Topic[] | undefined = data?.topics;
  const baseChapters: Chapter[] = data?.chapters ?? [];
  // Derive two topics dynamically from existing chapters if topics are not provided
  const derivedTopics: Topic[] | undefined = (!topicsFromMeta || topicsFromMeta.length === 0) && baseChapters.length > 0
    ? (() => {
        const mid = Math.ceil(baseChapters.length / 2);
        const first = baseChapters.slice(0, mid);
        const second = baseChapters.slice(mid);
        const toSub = (chs: Chapter[]) => chs.map((c) => ({ id: c.id, title: c.title, start: c.start, end: c.end, thumbnail: c.thumbnail }));
        const topics: Topic[] = [];
        if (first.length) topics.push({ id: "part-1", title: "Part 1", subchapters: toSub(first) });
        if (second.length) topics.push({ id: "part-2", title: "Part 2", subchapters: toSub(second) });
        return topics;
      })()
    : undefined;

  const topics: Topic[] | undefined = (topicsFromMeta && topicsFromMeta.length > 0) ? topicsFromMeta : derivedTopics;
  const chapters: Chapter[] = topics && topics.length
    ? topics.flatMap((t) => (t.subchapters || []).map((sc) => ({
        id: sc.id,
        title: sc.title,
        start: sc.start,
        end: sc.end,
        thumbnail: sc.thumbnail,
      } as Chapter)))
    : baseChapters;
  const videoUrl = data?.manifestUrl ?? ""; // can be an MP4 or an HLS .m3u8

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* YouTube-style Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-900 text-xl font-semibold">{data?.title ?? "Video Player"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - YouTube Layout */}
      <div className="pt-16 flex flex-col lg:flex-row gap-6 p-6 max-w-[1920px] mx-auto">
        {/* Left Side - Video Player */}
        <div className="flex-1">
          <div className="rounded-xl overflow-hidden bg-black">
            {/* Show player once we have a URL, otherwise a simple placeholder */}
            {videoUrl ? (
              <VideoPlayer
                videoUrl={videoUrl}
                chapters={chapters}
                topics={topics}
                currentTime={currentTime}
                onTimeUpdate={(t) => setCurrentTime(t)}
                onSeek={(t) => setCurrentTime(t)}
              />
            ) : (
              <div className="w-full aspect-video bg-black text-gray-300 flex items-center justify-center">
                {isLoading ? "Loading video..." : isError ? "Failed to load video" : "No video URL"}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chapters List */}
        <div className="w-full lg:w-[400px] xl:w-[450px] lg:sticky lg:top-20">
          <div className="lg:h-[calc((100vw-3rem-400px-1.5rem)*9/16)] xl:h-[calc((100vw-3rem-450px-1.5rem)*9/16)]">
            <ChapterSidebar
              chapters={chapters}
              topics={topics}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
