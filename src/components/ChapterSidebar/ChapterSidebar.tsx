import React, { useState } from "react";
import { formatTime } from "../../utils/time";
import type { Chapter } from "../../types/video";

interface ChapterSidebarProps {
  chapters: Chapter[];
  currentTime: number;
  onSeek: (time: number) => void;
}

const ChapterSidebar: React.FC<ChapterSidebarProps> = ({ chapters, currentTime, onSeek }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Modern Toggle Button */}
      <button
        className="fixed top-20 left-6 z-40 p-3 bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-lg hover:bg-slate-800 transition-all duration-200 ring-1 ring-slate-700/50 hover:ring-blue-500/50 group"
        onClick={() => setOpen(!open)}
      >
        <svg 
          className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Modern Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-slate-900/95 backdrop-blur-2xl shadow-2xl transform transition-all duration-300 ease-out z-50 border-r border-slate-800/50 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Chapters</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chapters List */}
        <div className="overflow-y-auto h-[calc(100%-5rem)] custom-scrollbar">
          <div className="p-4 space-y-2">
            {chapters.map((ch, index) => {
              const isActive = currentTime >= ch.start && (!ch.end || currentTime < ch.end);
              
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    onSeek(ch.start);
                    setOpen(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/10"
                      : "bg-slate-800/40 hover:bg-slate-800/60 ring-1 ring-slate-700/50 hover:ring-slate-600"
                  }`}
                >
                  {/* Chapter Number */}
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                      isActive 
                        ? "bg-blue-500 text-white" 
                        : "bg-slate-700/50 text-slate-400 group-hover:bg-slate-700"
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium mb-1 line-clamp-2 ${
                        isActive ? "text-white" : "text-slate-200 group-hover:text-white"
                      }`}>
                        {ch.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono ${
                          isActive ? "text-blue-300" : "text-slate-500 group-hover:text-slate-400"
                        }`}>
                          {formatTime(ch.start)}
                        </span>
                        {ch.end && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-slate-500">
                              {formatTime(ch.end - ch.start)} duration
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Play Icon */}
                    <div className={`flex-shrink-0 transition-all ${
                      isActive ? "opacity-100 scale-100" : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                    }`}>
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.5 4.5L15 10l-8.5 5.5V4.5z" />
                      </svg>
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(71 85 105 / 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(71 85 105 / 0.8);
        }
      `}</style>
    </>
  );
};

export default ChapterSidebar;