import { useQuery } from "@tanstack/react-query";
import { fetchVideoMetadata } from "../services/api";
import type { VideoMetadata } from "../types/video";


export function useVideoChapters(videoId: string) {
  return useQuery<VideoMetadata>({
    queryKey: ["videoMetadata", videoId],
    queryFn: () => fetchVideoMetadata(videoId),
  });
}
