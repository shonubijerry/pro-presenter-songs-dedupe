export type Env = {
  DB: D1Database;
  SONGS_BUCKET: R2Bucket;
  PROCESS_QUEUE: Queue;
  ASSETS: Fetcher;
};

export type UploadQueueMessage = {
  uploadId: string;
};

export type UploadRow = {
  id: string;
  object_key: string;
  original_name: string;
  status: string;
  threshold: number;
};

export type SongFeature = {
  fileName: string;
  rawText: string;
  normalizedLines: string[];
  lineCount: number;
};

export type DuplicateGroup = {
  members: Array<{ fileName: string; score: number }>;
};
