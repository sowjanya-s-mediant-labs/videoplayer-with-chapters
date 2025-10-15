import React, { useRef, useState } from "react";
import { useVideoChapters } from "../hooks/useVideoChapters";
import VideoPlayer from "../components/VideoPlayer/VideoPlayer";
import ChapterSidebar from "../components/ChapterSidebar/ChapterSidebar";

const VideoPage: React.FC = () => {
  const videoId = "sample-video";
  const { data, isLoading } = useVideoChapters(videoId);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-lg">Loading video...</p>
        </div>
      </div>
    );
  }

  const handleSeek = (time: number) => {
    const video = document.querySelector("video");
    if (video) {
      video.currentTime = time;
      video.play();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Modern Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.5 4.5L15 10l-8.5 5.5V4.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">VideoStream</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {Math.floor(data.duration / 60)}:{String(Math.floor(data.duration % 60)).padStart(2, '0')} min
            </span>
          </div>
        </div>
      </header>

      <ChapterSidebar
        chapters={data.chapters}
        currentTime={currentTime}
        onSeek={handleSeek}
      />

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6 flex items-center justify-center min-h-screen">
        <div className="max-w-6xl w-full">
          <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <VideoPlayer
              manifestUrl={data.manifestUrl}
              onTimeUpdate={(t) => setCurrentTime(t)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
