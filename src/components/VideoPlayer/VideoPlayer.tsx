

// VideoPlayer.tsx
import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import type { Chapter, Topic } from "../../types/video";
import { formatTime as formatMs } from "../../utils/time";

interface VideoPlayerProps {
  videoUrl: string;
  chapters: Chapter[];
  topics?: Topic[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSeek: (time: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  chapters, 
  topics,
  currentTime,
  onTimeUpdate, 
  onSeek 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [isChapterPanelOpen, setIsChapterPanelOpen] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // Ensure we honor any pending external seek after (re)loading source
      if (!Number.isNaN(currentTime) && currentTime > 0) {
        try {
          video.currentTime = currentTime;
        } catch {}
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [onTimeUpdate, currentTime]);

  // Load video source (supports MP4 and HLS)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Cleanup previous hls instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!videoUrl) {
      video.removeAttribute("src");
      video.load();
      return;
    }

    const isHls = /\.m3u8($|\?)/i.test(videoUrl);
    if (isHls) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari can play HLS natively
        video.src = videoUrl;
      } else if (Hls.isSupported()) {
        const hls = new Hls({ autoStartLoad: true });
        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        // Once manifest is parsed, ensure we seek to currentTime if needed
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!Number.isNaN(currentTime) && currentTime > 0) {
            try {
              video.currentTime = currentTime;
            } catch {}
          }
        });
      } else {
        // Fallback: set src anyway (some browsers/plugins may handle it)
        video.src = videoUrl;
      }
    } else {
      // MP4 or other directly supported format
      video.src = videoUrl;
    }

    // Reset play state on source change
    setIsPlaying(false);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl]);

  // Sync external seek with video
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekFromClientX = (clientX: number) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const width = rect?.width ?? 0;
    if (!(width > 0)) return; // avoid NaN when width is 0 in some prod layouts
    const clampedX = Math.max(rect.left, Math.min(clientX, rect.right));
    const posRaw = (clampedX - rect.left) / width;
    const pos = Number.isFinite(posRaw) ? Math.max(0, Math.min(1, posRaw)) : 0;
    const baseDuration = Number.isFinite(duration) && duration > 0
      ? duration
      : Number(videoRef.current.duration) || 0;
    if (!(baseDuration > 0)) return;
    const newTimeRaw = pos * baseDuration;
    const newTime = Number.isFinite(newTimeRaw) ? Math.max(0, Math.min(baseDuration, newTimeRaw)) : 0;
    // Seek and ensure playback resumes from the new position
    try {
      videoRef.current.currentTime = newTime;
    } catch {}
    if (Number.isFinite(newTime)) onSeek(newTime);
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        // Ignore autoplay restriction errors
      });
    }
    setPreviewTime(newTime);
    setPreviewPosition({ x: clampedX - rect.left, y: rect.top });
  };

  const handleProgressPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    e.preventDefault();
    try { (e.currentTarget as any).setPointerCapture?.(e.pointerId); } catch {}
    setIsDragging(true);
    draggingRef.current = true;
    seekFromClientX(e.clientX);

    const onMove = (ev: PointerEvent) => {
      if (!draggingRef.current) return;
      seekFromClientX(ev.clientX);
    };
    const cleanup = () => {
      setIsDragging(false);
      draggingRef.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      setPreviewTime(null);
    };
    const onUp = (_ev: PointerEvent) => cleanup();
    const onCancel = (_ev: PointerEvent) => cleanup();
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    window.addEventListener('pointercancel', onCancel, { once: true });
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const width = rect?.width ?? 0;
    if (!(width > 0)) return;
    const posRaw = (e.clientX - rect.left) / width;
    const pos = Number.isFinite(posRaw) ? Math.max(0, Math.min(1, posRaw)) : 0;
    const baseDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
    const time = pos * baseDuration;
    if (!Number.isFinite(time)) return;
    setPreviewTime(time);
    setPreviewPosition({ x: e.clientX - rect.left, y: rect.top });
  };

  const handleProgressLeave = () => {
    setPreviewTime(null);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Keep isFullscreen in sync with real fullscreen state
  useEffect(() => {
    const onFsChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs) setIsChapterPanelOpen(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Use utils formatter for display; internal logic stays in seconds

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isChapterPanelOpen) setShowControls(false);
    }, 3000);
  };

  // Get current chapter for preview
  const getCurrentChapter = (time: number) => {
    if (!Number.isFinite(time)) return undefined;
    const tMs = (Number(time) || 0) * 1000;
    for (let i = 0; i < chapters.length; i++) {
      const start = Number(chapters[i]?.start) || 0;
      const nextStart = Number(chapters[i + 1]?.start);
      const next = Number.isFinite(nextStart) ? (nextStart as number) : Number.POSITIVE_INFINITY;
      if (tMs >= start && tMs < next) return chapters[i];
    }
    return undefined;
  };

  const handlePreviewThumbError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const step = Number((img as any).dataset.fallbackStep || "0");
    const base = img.src.replace(/\.(jpg|jpeg|png|webp)(\?.*)?$/i, "");
    if (step === 0) {
      (img as any).dataset.fallbackStep = "1";
      img.src = `${base}.png`;
      return;
    }
    if (step === 1) {
      (img as any).dataset.fallbackStep = "2";
      img.src = `${base}.webp`;
      return;
    }
    // Hide if all fail
    (img as any).style.display = "none";
  };

  return (
    <div 
      className="relative w-full bg-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full aspect-video"
        onClick={togglePlay}
      />

      {/* Thumbnail Preview on Hover */}
      {previewTime !== null && (
        <div
          className="absolute bottom-20 pointer-events-none z-50"
          style={{ left: `${previewPosition.x}px`, transform: 'translateX(-50%)' }}
        >
          <div className="bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-700 w-[160px]">
            <div className="w-[160px] h-[90px] bg-gray-800 flex items-center justify-center overflow-hidden">
              {getCurrentChapter(previewTime)?.thumbnail ? (
                <img
                  src={getCurrentChapter(previewTime)!.thumbnail as string}
                  alt={getCurrentChapter(previewTime)!.title}
                  className="w-full h-full object-cover"
                  data-fallback-step="0"
                  onError={handlePreviewThumbError}
                />
              ) : (
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </div>
            <div className="px-2 py-1 bg-black w-[160px]">
              <div className="text-white text-xs font-semibold text-center">
                {formatMs((previewTime ?? 0) * 1000)}
              </div>
              {getCurrentChapter(previewTime) && (
                <div className="text-gray-400 text-[10px] text-center mt-0.5 truncate">
                  {getCurrentChapter(previewTime)?.title}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Progress Bar with Chapter Markers */}
        <div 
          ref={progressBarRef}
          className={`relative w-full ${isDragging ? 'h-1.5' : 'h-1'} bg-gray-700 cursor-pointer hover:h-1.5 transition-all group/progress mx-3 mb-2`}
          style={{ touchAction: 'none' }}
          onPointerDown={handleProgressPointerDown}
          onMouseMove={handleProgressHover}
          onMouseLeave={handleProgressLeave}
        >
          {/* Chapter Markers (gaps) */}
          {chapters.map((chapter, index) => {
            if (index === 0) return null; // Skip first chapter
            const position = ((Number(chapter.start) || 0) / 1000 / (duration || 1)) * 100;
            return (
              <div
                key={chapter.id}
                className="absolute top-0 w-[2px] h-full bg-[#0f0f0f] z-10"
                style={{ left: `${position}%` }}
              />
            );
          })}
          
          {/* Progress Fill */}
          <div 
            className="absolute top-0 left-0 h-full bg-red-600 z-20"
            style={{ width: `${(Number.isFinite(duration) && duration > 0) ? Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0}%` }}
          >
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 ${isDragging ? 'w-3.5 h-3.5' : 'w-3 h-3'} bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition-[opacity,transform] shadow-lg`} />
          </div>
        </div>
        {/* Current Chapter pill (fullscreen only) */}
        {isFullscreen && (
          <div className="px-3 pb-2 flex">
            <button
              type="button"
              onClick={() => setIsChapterPanelOpen(v => !v)}
              className="pointer-events-auto inline-flex items-center gap-2 max-w-[60vw] bg-black/70 text-white rounded-full px-3 py-1 text-xs shadow hover:bg-black/80"
            >
              <span className="truncate">
                {getCurrentChapter(currentTime)?.title || 'Current chapter'}
              </span>
              <span className={`transition-transform ${isChapterPanelOpen ? 'rotate-90' : ''}`}>&gt;</span>
            </button>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-between px-3 pb-2">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-red-600 transition-colors">
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-red-600 transition-colors">
              {isMuted ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
              )}
            </button>
            <span className="text-white text-sm font-medium">
              {formatMs(currentTime * 1000)} / {formatMs(duration * 1000)}
            </span>
          </div>
          <button onClick={toggleFullscreen} className="text-white hover:text-red-600 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Right slide-in chapter panel (fullscreen only) */}
      {isFullscreen && (
        <div
          className="pointer-events-auto absolute top-0 right-0 bottom-0 z-50 w-[360px] max-w-[45vw] bg-black/90 border-l border-gray-700 text-white transition-transform duration-300 flex flex-col"
          style={{ transform: isChapterPanelOpen ? 'translateX(0)' : 'translateX(100%)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
              </svg>
              Chapters
            </div>
            <button
              type="button"
              onClick={() => setIsChapterPanelOpen(false)}
              className="p-1 rounded hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19L19 6M6 6l13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {topics && topics.length > 0 ? (
              <div>
                {topics.map((t) => (
                  <div key={t.id} className="mb-1">
                    <div className="px-2 py-1 text-sm font-semibold text-gray-200">{t.title}</div>
                    {(t.subchapters || []).map((sc) => {
                      const start = Number(sc.start) || 0;
                      const nextIdx = chapters.findIndex(c => c.start > start);
                      const nextStart = nextIdx >= 0 ? chapters[nextIdx].start : Number.POSITIVE_INFINITY;
                      const curMs = (Number(currentTime) || 0) * 1000;
                      const active = curMs >= start && curMs < nextStart;
                      return (
                        <button
                          key={sc.id}
                          onClick={() => onSeek(start / 1000)}
                          className={`w-full p-2 rounded flex gap-3 items-center text-left hover:bg-white/10 ${active ? 'bg-white/10' : ''}`}
                        >
                          <div className="w-[84px] h-[48px] bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {sc.thumbnail ? (
                              <img src={sc.thumbnail} alt={sc.title} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${active ? 'text-white' : 'text-gray-200'}`}>{sc.title}</div>
                            <div className="text-[11px] text-gray-400">{formatMs(start)}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              chapters.map((ch, index) => {
                const start = Number(ch.start) || 0;
                const next = Number(chapters[index + 1]?.start);
                const nextStart = Number.isFinite(next) ? (next as number) : Number.POSITIVE_INFINITY;
                const curMs = (Number(currentTime) || 0) * 1000;
                const active = curMs >= start && curMs < nextStart;
                return (
                  <button
                    key={ch.id}
                    onClick={() => onSeek(start / 1000)}
                    className={`w-full p-2 rounded flex gap-3 items-center text-left hover:bg-white/10 ${active ? 'bg-white/10' : ''}`}
                  >
                    <div className="w-[84px] h-[48px] bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {ch.thumbnail ? (
                        <img src={ch.thumbnail} alt={ch.title} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium truncate ${active ? 'text-white' : 'text-gray-200'}`}>{ch.title}</div>
                      <div className="text-[11px] text-gray-400">{formatMs(start)}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
