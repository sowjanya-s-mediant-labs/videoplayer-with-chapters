// ChapterSidebar.tsx
import React from "react";
import { formatTime } from "../../utils/time";
import type { Chapter, Topic } from "../../types/video";

interface ChapterSidebarProps {
  chapters: Chapter[];
  topics?: Topic[];
  currentTime: number;
  onSeek: (time: number) => void;
}

const ChapterSidebar: React.FC<ChapterSidebarProps> = ({ chapters, topics, currentTime, onSeek }) => {
  // Determine active chapter by comparing current time with this start and next chapter's start
  const activeIndex = React.useMemo(() => {
    if (!chapters || chapters.length === 0) return -1;
    for (let i = 0; i < chapters.length; i++) {
      // currentTime is in seconds (from <video>), chapters are in milliseconds
      const start = Number(chapters[i]?.start) || 0; // ms
      const nextStart = Number(chapters[i + 1]?.start);
      const next = Number.isFinite(nextStart) ? (nextStart as number) : Number.POSITIVE_INFINITY; // ms
      const currentMs = (Number(currentTime) || 0) * 1000; // convert sec -> ms
      if (currentMs >= start && currentMs < next) return i;
    }
    return -1;
  }, [chapters, currentTime]);

const handleThumbError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const img = e.currentTarget;
  const step = Number(img.dataset.fallbackStep || "0");

  const base = img.src.replace(/\.(jpg|jpeg|png|webp)(\?.*)?$/i, "");

  if (step === 0) {
    img.dataset.fallbackStep = "1";
    img.src = `${base}.png`;
    return;
  }

  if (step === 1) {
    img.dataset.fallbackStep = "2";
    img.src = `${base}.webp`;
    return;
  }

  // All failed → hide
  img.style.display = "none";
};

  const [openTopicIds, setOpenTopicIds] = React.useState<Set<string>>(new Set());
  React.useEffect(() => {
    if (!topics || topics.length === 0) return;
    // Open all topics by default (preserve prior always-visible chapters)
    setOpenTopicIds(new Set(topics.map(t => t.id)));
  }, [topics]);
  React.useEffect(() => {
    if (!topics || topics.length === 0) return;
    if (activeIndex >= 0) {
      const activeId = chapters[activeIndex]?.id;
      const containing = topics.find(t => (t.subchapters || []).some(sc => sc.id === activeId));
      if (containing) setOpenTopicIds(prev => new Set(prev).add(containing.id));
    }
  }, [activeIndex, chapters, topics]);
  const toggleTopic = (id: string) => {
    setOpenTopicIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  // console.log("ch/", chapters);
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-gray-900 text-lg font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
          </svg>
          Chapters
        </h2>
      </div>

      {/* Chapters List (group by topics with per-topic accordions if provided) */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
        {topics && topics.length > 0 ? (
          topics.map((t) => {
            const isOpen = openTopicIds.has(t.id);
            return (
              <div key={t.id} className="border-b border-gray-100">
                <button
                  className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50"
                  onClick={() => toggleTopic(t.id)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-gray-900 text-left truncate">{t.title}</span>
                  <span className={`text-gray-600 transition-transform ${isOpen ? 'rotate-90' : ''}`}>&gt;</span>
                </button>
                {isOpen && (
                  <div>
                    {(t.subchapters || []).map((sc) => {
                      const idx = chapters.findIndex((c) => c.id === sc.id);
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          key={sc.id}
                          onClick={() => onSeek((Number(sc.start) || 0) / 1000)}
                          className={`w-full px-4 py-2 flex gap-3 hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`}
                        >
                          <div className="w-[84px] h-[48px] bg-gray-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {sc.thumbnail ? (
                              <img src={sc.thumbnail} alt={sc.title} className="w-full h-full object-cover" onError={(e)=>handleThumbError(e as any)} />
                            ) : (
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 text-left">
                            <div className={`text-sm font-medium truncate ${isActive ? 'text-red-600' : 'text-gray-900'}`}>{sc.title}</div>
                            <div className="text-xs text-gray-500">{formatTime(Number(sc.start) || 0)}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          chapters.map((ch, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={ch.id}
                onClick={() => onSeek((Number(ch.start) || 0) / 1000)}
                className={`w-full p-3 flex gap-3 hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-100' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-[126px] h-[71px] bg-gray-200 rounded-md overflow-hidden">
                    {ch.thumbnail ? (
                      <img src={ch.thumbnail} alt={ch.title} className="w-full h-full object-cover" data-fallback-step="0" onError={handleThumbError} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-semibold px-1 py-0.5 rounded">
                    {formatTime(Number(ch.start) || 0)}
                  </div>
                  {isActive && (<div className="absolute inset-0 border-2 border-red-600 rounded-md pointer-events-none" />)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className={`text-sm font-medium line-clamp-2 mb-1 ${isActive ? 'text-red-600' : 'text-gray-900'}`}>{ch.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatTime(Number(ch.start) || 0)}</span>
                    {ch.end && (<><span>•</span><span>{formatTime((Number(ch.end) || 0) - (Number(ch.start) || 0))}</span></>)}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f5f5f5;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default ChapterSidebar;
