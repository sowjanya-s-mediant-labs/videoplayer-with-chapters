
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
  // Determine active chapter by comparing current time with this start and next chapter's start
  const activeIndex = React.useMemo(() => {
    if (!chapters || chapters.length === 0) return -1;
    for (let i = 0; i < chapters.length; i++) {
      const start = Number(chapters[i]?.start) || 0;
      const nextStart = Number(chapters[i + 1]?.start);
      const next = Number.isFinite(nextStart) ? (nextStart as number) : Number.POSITIVE_INFINITY;
      if (currentTime >= start && currentTime < next) return i;
    }
    return -1;
  }, [chapters, currentTime]);

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
          const isActive = index === activeIndex;
          
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
                {/* Thumbnail reduced to ~75% of original (168x94 -> 126x71) */}
                <div className="w-[126px] h-[71px] bg-[#272727] rounded-md overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                {/* Duration Badge */}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-semibold px-1 py-0.5 rounded">
                  {formatTime(ch.start)}
                </div>
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute inset-0 border-2 border-red-600 rounded-md pointer-events-none" />
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
