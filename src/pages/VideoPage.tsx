// VideoPage.tsx
import React, { useState } from "react";
import VideoPlayer from "../components/VideoPlayer/VideoPlayer";
import ChapterSidebar from "../components/ChapterSidebar/ChapterSidebar";
import type { Chapter } from "../types/video";

const VideoPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(0);

  // Define your chapters here with start times in seconds
  const chapters: Chapter[] = [
    {
      id: "1",
      title: "Introduction to the Course",
      start: 0,
      end: 10,
    },
    {
      id: "2",
      title: "Setting Up Your Environment",
      start: 10,
      end: 60,
    },
    {
      id: "3",
      title: "Understanding the Basics",
      start: 60,
      end: 80,
    },
    {
      id: "4",
      title: "Advanced Techniques",
      start: 80,
      end: 120,
    },
    {
      id: "5",
      title: "Real World Examples",
      start: 120,
      end: 167,
    },
  ];

  // Place your video in: public/videos/sample.mp4
  // Or:  (then import it)
  const videoUrl = "src/assets/videos/sample-video.mp4"; // This looks for the file in public/videos/

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
            <VideoPlayer
              videoUrl={videoUrl}
              chapters={chapters}
              currentTime={currentTime}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onSeek={(t) => setCurrentTime(t)}
            />
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
