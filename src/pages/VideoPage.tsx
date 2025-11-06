// VideoPage.tsx
import React, { useState } from "react";
import VideoPlayer from "../components/VideoPlayer/VideoPlayer";
import ChapterSidebar from "../components/ChapterSidebar/ChapterSidebar";
import type { Chapter } from "../types/video";
import { useVideoChapters } from "../hooks/useVideoChapters";

const VideoPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(0);

  // Load metadata (chapters + video URL) at runtime
  // Replace 'demo' with your real videoId and ensure public/metadata/<videoId>.json exists
  const { data, isLoading, isError } = useVideoChapters("demo");
  const chapters: Chapter[] = data?.chapters ?? [];
  const videoUrl = data?.manifestUrl ?? ""; // can be an MP4 or an HLS .m3u8

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* YouTube-style Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f] border-b border-gray-800">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-white text-xl font-semibold">Mediant Labs</span>
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
                currentTime={currentTime}
                onTimeUpdate={(t) => setCurrentTime(t)}
                onSeek={(t) => setCurrentTime(t)}
              />
            ) : (
              <div className="w-full aspect-video bg-black text-gray-400 flex items-center justify-center">
                {isLoading ? "Loading video..." : isError ? "Failed to load video" : "No video URL"}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chapters List */}
        <div className="lg:w-[400px] xl:w-[450px]">
          <ChapterSidebar
            chapters={chapters}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
