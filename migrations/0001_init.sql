CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  original_name TEXT NOT NULL,
  object_key TEXT NOT NULL,
  status TEXT NOT NULL,
  threshold REAL NOT NULL,
  error_message TEXT,
  total_files INTEGER NOT NULL DEFAULT 0,
  duplicate_groups INTEGER NOT NULL DEFAULT 0,
  kept_files INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  is_duplicate INTEGER NOT NULL DEFAULT 0,
  kept_in_output INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(upload_id) REFERENCES uploads(id)
);

CREATE TABLE IF NOT EXISTS duplicate_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(upload_id) REFERENCES uploads(id)
);

CREATE TABLE IF NOT EXISTS duplicate_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  song_id INTEGER NOT NULL,
  score REAL NOT NULL,
  FOREIGN KEY(group_id) REFERENCES duplicate_groups(id),
  FOREIGN KEY(song_id) REFERENCES songs(id)
);

CREATE TABLE IF NOT EXISTS download_links (
  token TEXT PRIMARY KEY,
  upload_id TEXT NOT NULL,
  object_key TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(upload_id) REFERENCES uploads(id)
);

CREATE INDEX IF NOT EXISTS idx_songs_upload_id ON songs(upload_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_groups_upload_id ON duplicate_groups(upload_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_members_group_id ON duplicate_members(group_id);
CREATE INDEX IF NOT EXISTS idx_download_links_upload_id ON download_links(upload_id);
