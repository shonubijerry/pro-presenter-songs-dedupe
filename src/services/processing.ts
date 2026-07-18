import { DOWNLOAD_TTL_DAYS } from "../constants";
import { buildDuplicateGroups, chooseKeptFiles } from "./similarity";
import { extractSongFeatures, streamDeduplicatedZip } from "./zip";
import type { DuplicateGroup, Env, SongFeature, UploadRow } from "../types";

type UploadRowFull = UploadRow & { auto_mode: number };

export async function processUpload(uploadId: string, env: Env): Promise<void> {
  const upload = await env.DB.prepare(
    `SELECT id, object_key, original_name, status, threshold, auto_mode FROM uploads WHERE id = ?`
  )
    .bind(uploadId)
    .first<UploadRowFull>();

  if (!upload) {
    return;
  }

  await setUploadStatus(uploadId, "processing", env);

  try {
    const object = await env.SONGS_BUCKET.get(upload.object_key);
    if (!object || !object.body) {
      throw new Error("Uploaded ZIP was not found in storage");
    }

    const songs = await extractSongFeatures(object.body);
    if (songs.length === 0) {
      throw new Error("No .txt files found in the uploaded ZIP");
    }

    const groups = buildDuplicateGroups(songs, upload.threshold);
    const keepSet = chooseKeptFiles(songs, groups);

    await persistScan(uploadId, songs, groups, keepSet, env, Boolean(upload.auto_mode));

    // Both modes now land in review so users can adjust selections before finalizing.
    // auto_mode=true preselects the best candidate per duplicate group.
    // auto_mode=false requires manual selection for each duplicate group.
    const keptCount = await countKeptFiles(uploadId, env);
    await env.DB.prepare(
      `UPDATE uploads SET status = 'review', error_message = NULL, total_files = ?, duplicate_groups = ?, kept_files = ?, updated_at = ? WHERE id = ?`
    ).bind(songs.length, groups.length, keptCount, new Date().toISOString(), uploadId).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown processing error";
    await env.DB.prepare(`UPDATE uploads SET status = 'failed', error_message = ?, updated_at = ? WHERE id = ?`)
      .bind(message, new Date().toISOString(), uploadId)
      .run();
  }
}

/** Called from the finalize API route after user manually picks which songs to keep. */
export async function finalizeUpload(
  uploadId: string,
  env: Env,
): Promise<{ token: string; url: string; expiresAt: string } | { error: string }> {
  const upload = await env.DB.prepare(
    `SELECT id, object_key, status FROM uploads WHERE id = ?`
  ).bind(uploadId).first<Record<string, unknown>>();

  if (!upload) return { error: "Upload not found" };
  if (upload.status !== "review") return { error: "Upload is not awaiting review" };

  const unresolvedGroupCount = await countUnresolvedGroups(uploadId, env);
  if (unresolvedGroupCount > 0) {
    return { error: `Choose one file to keep in all ${unresolvedGroupCount} remaining duplicate group(s).` };
  }

  await generateDownload(uploadId, String(upload.object_key), env);
  const keptCount = await countKeptFiles(uploadId, env);
  await env.DB.prepare(
    `UPDATE uploads SET status = 'ready', kept_files = ?, updated_at = ? WHERE id = ?`
  ).bind(keptCount, new Date().toISOString(), uploadId).run();

  const link = await env.DB.prepare(
    `SELECT token, expires_at FROM download_links WHERE upload_id = ? ORDER BY created_at DESC LIMIT 1`
  ).bind(uploadId).first<{ token: string; expires_at: string }>();

  if (!link) {
    return { error: "Failed to generate download link" };
  }

  return {
    token: link.token,
    url: `/api/downloads/${link.token}`,
    expiresAt: link.expires_at,
  };
}

export async function keepSongInGroup(
  groupId: number,
  songId: number,
  env: Env,
): Promise<{ uploadId: string; keptFiles: number } | { error: string }> {
  const row = await env.DB.prepare(
    `SELECT g.upload_id AS upload_id
     FROM duplicate_groups g
     JOIN duplicate_members m ON m.group_id = g.id
     WHERE g.id = ? AND m.song_id = ?`
  ).bind(groupId, songId).first<{ upload_id: string }>();

  if (!row) {
    return { error: "Duplicate group or song was not found" };
  }

  await env.DB.prepare(
    `UPDATE songs
     SET kept_in_output = CASE WHEN id = ? THEN 1 ELSE 0 END
     WHERE id IN (SELECT song_id FROM duplicate_members WHERE group_id = ?)`
  ).bind(songId, groupId).run();

  const keptFiles = await countKeptFiles(row.upload_id, env);
  await env.DB.prepare(
    `UPDATE uploads SET kept_files = ?, updated_at = ? WHERE id = ?`
  ).bind(keptFiles, new Date().toISOString(), row.upload_id).run();

  return { uploadId: row.upload_id, keptFiles };
}

async function generateDownload(uploadId: string, objectKey: string, env: Env): Promise<void> {
  const object = await env.SONGS_BUCKET.get(objectKey);
  if (!object || !object.body) throw new Error("Source ZIP not found in storage");

  const rows = await env.DB.prepare(
    `SELECT file_name FROM songs WHERE upload_id = ? AND kept_in_output = 1`
  ).bind(uploadId).all<{ file_name: string }>();
  const keepSet = new Set(rows.results.map((r) => r.file_name));

  const dedupeKey = `downloads/${uploadId}/deduplicated.zip`;
  const outputStream = await streamDeduplicatedZip(object.body, keepSet);
  const outputBytes = await streamToUint8Array(outputStream);
  await env.SONGS_BUCKET.put(dedupeKey, outputBytes, { httpMetadata: { contentType: "application/zip" } });

  const token = crypto.randomUUID().replace(/-/g, "");
  const createdAt = new Date();
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + DOWNLOAD_TTL_DAYS);
  await env.DB.prepare(
    `INSERT OR REPLACE INTO download_links (token, upload_id, object_key, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`
  ).bind(token, uploadId, dedupeKey, expiresAt.toISOString(), createdAt.toISOString()).run();

  await env.SONGS_BUCKET.delete(objectKey);
}

async function countKeptFiles(uploadId: string, env: Env): Promise<number> {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) as n FROM songs WHERE upload_id = ? AND kept_in_output = 1`
  ).bind(uploadId).first<{ n: number }>();
  return row?.n ?? 0;
}

async function setUploadStatus(uploadId: string, status: string, env: Env): Promise<void> {
  await env.DB.prepare(`UPDATE uploads SET status = ?, updated_at = ? WHERE id = ?`)
    .bind(status, new Date().toISOString(), uploadId)
    .run();
}

async function persistScan(
  uploadId: string,
  songs: SongFeature[],
  groups: DuplicateGroup[],
  keepSet: Set<string>,
  env: Env,
  autoMode: boolean,
): Promise<void> {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM duplicate_members WHERE group_id IN (SELECT id FROM duplicate_groups WHERE upload_id = ?)").bind(uploadId),
    env.DB.prepare("DELETE FROM duplicate_groups WHERE upload_id = ?").bind(uploadId),
    env.DB.prepare("DELETE FROM songs WHERE upload_id = ?").bind(uploadId),
    env.DB.prepare("DELETE FROM download_links WHERE upload_id = ?").bind(uploadId),
  ]);

  const duplicateNames = new Set<string>();
  for (const group of groups) {
    for (const member of group.members.slice(1)) {
      duplicateNames.add(member.fileName);
    }
  }

  const insertSongStatements = songs.map((song) =>
    env.DB.prepare(
      `INSERT INTO songs (upload_id, file_name, raw_text, is_duplicate, kept_in_output)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      uploadId,
      song.fileName,
      song.rawText,
      duplicateNames.has(song.fileName) ? 1 : 0,
      autoMode ? (keepSet.has(song.fileName) ? 1 : 0) : (duplicateNames.has(song.fileName) ? 0 : 1),
    ),
  );
  await runInChunks(insertSongStatements, env.DB, 100);

  const songRows = await env.DB.prepare(`SELECT id, file_name FROM songs WHERE upload_id = ?`)
    .bind(uploadId)
    .all<Record<string, unknown>>();

  const songIdByName = new Map<string, number>();
  for (const row of songRows.results) {
    songIdByName.set(String(row.file_name), Number(row.id));
  }

  for (const group of groups) {
    const groupInsert = await env.DB.prepare(`INSERT INTO duplicate_groups (upload_id, created_at) VALUES (?, ?)`)
      .bind(uploadId, new Date().toISOString())
      .run();

    const groupId = Number(groupInsert.meta.last_row_id);
    const memberStatements = group.members
      .map((member) => {
        const songId = songIdByName.get(member.fileName);
        if (!songId) {
          return null;
        }

        return env.DB.prepare(`INSERT INTO duplicate_members (group_id, song_id, score) VALUES (?, ?, ?)`).bind(
          groupId,
          songId,
          member.score,
        );
      })
      .filter((statement): statement is D1PreparedStatement => statement !== null);

    await runInChunks(memberStatements, env.DB, 100);
  }
}

async function runInChunks(statements: D1PreparedStatement[], db: D1Database, chunkSize: number): Promise<void> {
  for (let index = 0; index < statements.length; index += chunkSize) {
    await db.batch(statements.slice(index, index + chunkSize));
  }
}

async function countUnresolvedGroups(uploadId: string, env: Env): Promise<number> {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS n
     FROM (
       SELECT g.id
       FROM duplicate_groups g
       JOIN duplicate_members m ON m.group_id = g.id
       JOIN songs s ON s.id = m.song_id
       WHERE g.upload_id = ?
       GROUP BY g.id
       HAVING SUM(CASE WHEN s.kept_in_output = 1 THEN 1 ELSE 0 END) != 1
     ) unresolved`
  ).bind(uploadId).first<{ n: number }>();

  return row?.n ?? 0;
}

async function streamToUint8Array(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    if (value && value.length > 0) {
      chunks.push(value);
      totalLength += value.length;
    }
  }

  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return merged;
}
