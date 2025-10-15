import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  manifestUrl: string;
  onTimeUpdate?: (time: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ manifestUrl, onTimeUpdate }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = manifestUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [manifestUrl]);

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        controls
        className="w-full h-[70vh] object-contain"
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
};

export default VideoPlayer;
