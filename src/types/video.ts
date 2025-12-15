export interface Chapter {
  id: string;
  title: string;
  start: number; // in milliseconds
  end?: number;
  thumbnail?: string;
}

export interface SubChapter {
  id: string;
  title: string;
  start: number; // in milliseconds
  end?: number;
  thumbnail?: string;
}

export interface Topic {
  id: string;
  title: string;
  subchapters: SubChapter[];
}

export interface VideoMetadata {
  videoId: string;
  duration: number; // in milliseconds
  // Chapters is optional: when omitted, UI derives from topics.subchapters
  chapters?: Chapter[];
  manifestUrl: string;
  title?: string;
  // Optional base path for thumbnails; if present, chapter thumbnails default to
  // `${thumbnailsBase}/${chapter.id}.jpg` unless chapter.thumbnail overrides it
  thumbnailsBase?: string;
  topics?: Topic[];
}
