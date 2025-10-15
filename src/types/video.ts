export interface Chapter {
  id: string;
  title: string;
  start: number; // in seconds
  end?: number;
  thumbnail?: string;
}

export interface VideoMetadata {
  videoId: string;
  duration: number;
  chapters: Chapter[];
  manifestUrl: string;
}
