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
    <div className="rounded-xl border flex flex-col" style={{ backgroundColor: 'var(--GRAY5)', borderColor: 'var(--GRAY4)', maxHeight: '600px', height: '100%' }}>
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--GRAY4)' }}>
        <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--DAY)' }}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
          </svg>
          Chapters
        </h2>
      </div>

      {/* Chapters List (group by topics with per-topic accordions if provided) */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {topics && topics.length > 0 ? (
          topics.map((t) => {
            const isOpen = openTopicIds.has(t.id);
            return (
              <div key={t.id} className="border-b" style={{ borderColor: 'var(--GRAY4)' }}>
                <button
                  className="w-full px-4 py-2 flex items-center justify-between chapter-hover"
                  onClick={() => toggleTopic(t.id)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-left truncate" style={{ color: 'var(--DAY)' }}>{t.title}</span>
                  <span className="transition-transform" style={{ color: 'var(--GRAY3)' }}>{isOpen ? '▼' : '▶'}</span>
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
                          className={`w-full px-4 py-2 flex gap-3 ${isActive ? '' : 'chapter-hover'}`}
                          style={isActive ? { backgroundColor: 'rgba(236, 100, 43, 0.2)' } : {}}
                        >
                          <div className="w-[84px] h-[48px] bg-gray-700 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {sc.thumbnail ? (
                              <img src={sc.thumbnail} alt={sc.title} className="w-full h-full object-cover" onError={(e)=>handleThumbError(e as any)} />
                            ) : (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--GRAY3)' }}>
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 text-left">
                            <div className={`text-sm font-medium truncate`} style={{ color: isActive ? 'var(--ALERT1)' : 'var(--DAY)' }}>{sc.title}</div>
                            <div className="text-xs" style={{ color: 'var(--GRAY3)' }}>{formatTime(Number(sc.start) || 0)}</div>
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
                className={`w-full p-3 flex gap-3 transition-colors ${isActive ? '' : 'chapter-hover'}`}
                style={isActive ? { backgroundColor: 'rgba(236, 100, 43, 0.2)' } : {}}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-[126px] h-[71px] bg-gray-700 rounded-md overflow-hidden">
                    {ch.thumbnail ? (
                      <img src={ch.thumbnail} alt={ch.title} className="w-full h-full object-cover" data-fallback-step="0" onError={handleThumbError} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--GRAY3)' }}>
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-semibold px-1 py-0.5 rounded">
                    {formatTime(Number(ch.start) || 0)}
                  </div>
                  {isActive && (<div className="absolute inset-0 border-2 rounded-md pointer-events-none" style={{ borderColor: 'var(--ALERT1)' }} />)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className={`text-sm font-medium line-clamp-2 mb-1`} style={{ color: isActive ? 'var(--ALERT1)' : 'var(--DAY)' }}>{ch.title}</h3>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--GRAY3)' }}>
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
          background: var(--GRAY5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--GRAY4);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--GRAY3);
        }
      `}</style>
    </div>
  );
};

export default ChapterSidebar;
