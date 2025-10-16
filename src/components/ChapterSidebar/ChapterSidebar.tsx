
// ChapterSidebar.tsx
import React from "react";
import { formatTime } from "../../utils/time";
import type { Chapter } from "../../types/video";

interface ChapterSidebarProps {
  chapters: Chapter[];
  currentTime: number;
  onSeek: (time: number) => void;
}

const ChapterSidebar: React.FC<ChapterSidebarProps> = ({ chapters, currentTime, onSeek }) => {
  return (
    <div className="bg-[#0f0f0f] rounded-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white text-lg font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
          </svg>
          Chapters
        </h2>
      </div>

      {/* Chapters List */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
        {chapters.map((ch, index) => {
          const isActive = currentTime >= ch.start && (!ch.end || currentTime < ch.end);
          
          return (
            <button
              key={ch.id}
              onClick={() => onSeek(ch.start)}
              className={`w-full p-3 flex gap-3 hover:bg-[#272727] transition-colors ${
                isActive ? "bg-[#272727]" : ""
              }`}
            >
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                <div className="w-[168px] h-[94px] bg-[#272727] rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                {/* Duration Badge */}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                  {formatTime(ch.start)}
                </div>
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute inset-0 border-2 border-red-600 rounded-lg pointer-events-none" />
                )}
              </div>

              {/* Chapter Info */}
              <div className="flex-1 text-left min-w-0">
                <h3 className={`text-sm font-medium line-clamp-2 mb-1 ${
                  isActive ? "text-red-600" : "text-white"
                }`}>
                  {ch.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{formatTime(ch.start)}</span>
                  {ch.end && (
                    <>
                      <span>•</span>
                      <span>{formatTime(ch.end - ch.start)}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f0f0f;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f3f;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4f4f4f;
        }
      `}</style>
    </div>
  );
};

export default ChapterSidebar;