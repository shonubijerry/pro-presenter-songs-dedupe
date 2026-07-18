import { Router } from "itty-router";
import { MAX_UPLOAD_BYTES } from "../constants";
import { finalizeUpload, keepSongInGroup, processUpload } from "../services/processing";
import { json } from "../utils/http";
import type { Env, UploadQueueMessage } from "../types";

type RequestWithParams = Request & {
  params?: {
    uploadId?: string;
    token?: string;
    groupId?: string;
    songId?: string;
  };
};

const router = Router<RequestWithParams>();

router.post("/api/uploads", async (request, env: Env) =>
  handleUpload(request, env),
);

router.get("/api/uploads/:uploadId", async (request, env: Env) => {
  const uploadId = request.params?.uploadId;
  if (!uploadId) {
    return json({ error: "Missing upload id" }, 400);
  }
  return handleUploadStatus(uploadId, env);
});

router.get("/api/duplicates", async (request, env: Env) => {
  const uploadId = new URL(request.url).searchParams.get("uploadId") || "";
  if (!uploadId) {
    return json({ error: "Missing uploadId" }, 400);
  }
  return handleDuplicates(uploadId, env);
});

router.get("/api/downloads/:token", async (request, env: Env) => {
  const token = request.params?.token;
  if (!token) {
    return json({ error: "Missing token" }, 400);
  }
  return handleDownload(token, env);
});

router.post("/api/groups/:groupId/keep/:songId", async (request, env: Env) => {
  const groupId = Number(request.params?.groupId);
  const songId = Number(request.params?.songId);
  if (!Number.isInteger(groupId) || !Number.isInteger(songId)) {
    return json({ error: "Invalid group or song id" }, 400);
  }
  return handleKeepSong(groupId, songId, env);
});

router.post("/api/uploads/:uploadId/finalize", async (request, env: Env) => {
  const uploadId = request.params?.uploadId;
  if (!uploadId) {
    return json({ error: "Missing upload id" }, 400);
  }
  return handleFinalizeUpload(uploadId, env);
});

export async function handleFetch(
  request: Request,
  env: Env,
): Promise<Response> {
  const response = await router.fetch(request as RequestWithParams, env);
  return response ?? env.ASSETS.fetch(request);
}

export async function handleQueue(
  batch: MessageBatch<UploadQueueMessage>,
  env: Env,
  ctx: ExecutionContext,
): Promise<void> {
  for (const message of batch.messages) {
    ctx.waitUntil(processUpload(message.body.uploadId, env));
    message.ack();
  }
}

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const form = await request.formData();
  const file = form.get("file");
  const thresholdRaw = form.get("threshold");

  if (!(file instanceof File)) {
    return json({ error: "file is required" }, 400);
  }

  if (!file.name.toLowerCase().endsWith(".zip")) {
    return json({ error: "Only .zip files are allowed" }, 400);
  }

  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    return json({ error: "ZIP must be between 1 byte and 50MB" }, 400);
  }

  const threshold = Number(thresholdRaw ?? "0.75");
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) {
    return json({ error: "threshold must be > 0 and <= 1" }, 400);
  }

  const autoMode = form.get("autoMode") !== "false" ? 1 : 0;

  const now = new Date().toISOString();
  const uploadId = crypto.randomUUID();
  const objectKey = `uploads/${uploadId}.zip`;

  await env.SONGS_BUCKET.put(objectKey, file.stream(), {
    httpMetadata: { contentType: "application/zip" },
    customMetadata: { uploadId, originalName: file.name },
  });

  await env.DB.prepare(
    `INSERT INTO uploads (id, original_name, object_key, status, threshold, auto_mode, created_at, updated_at)
     VALUES (?, ?, ?, 'queued', ?, ?, ?, ?)`
  )
    .bind(uploadId, file.name, objectKey, threshold, autoMode, now, now)
    .run();

  await env.PROCESS_QUEUE.send({ uploadId });

  return json({ uploadId, status: "queued" }, 202);
}

async function handleUploadStatus(
  uploadId: string,
  env: Env,
): Promise<Response> {
  const upload = await env.DB.prepare(
    `SELECT id, original_name, status, threshold, error_message, total_files, duplicate_groups, kept_files, created_at, updated_at
     FROM uploads WHERE id = ?`,
  )
    .bind(uploadId)
    .first<Record<string, unknown>>();

  if (!upload) {
    return json({ error: "Upload not found" }, 404);
  }

  const download = await env.DB.prepare(
    `SELECT token, expires_at FROM download_links WHERE upload_id = ? ORDER BY created_at DESC LIMIT 1`,
  )
    .bind(uploadId)
    .first<Record<string, unknown>>();

  return json({
    upload,
    download: download
      ? {
          token: String(download.token),
          url: `/api/downloads/${String(download.token)}`,
          expiresAt: String(download.expires_at),
        }
      : null,
  });
}

async function handleDuplicates(uploadId: string, env: Env): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT g.id AS group_id, m.score AS score, s.file_name AS file_name, s.id AS song_id, s.raw_text AS raw_text, s.kept_in_output AS kept_in_output
     FROM duplicate_groups g
     JOIN duplicate_members m ON g.id = m.group_id
     JOIN songs s ON s.id = m.song_id
     WHERE g.upload_id = ?
     ORDER BY g.id ASC, m.score DESC`,
  )
    .bind(uploadId)
    .all<Record<string, unknown>>();

  const groups = new Map<
    number,
    { id: number; members: Array<{ songId: number; fileName: string; score: number; rawText: string; keptInOutput: boolean }> }
  >();

  for (const row of rows.results) {
    const groupId = Number(row.group_id);
    if (!groups.has(groupId)) {
      groups.set(groupId, { id: groupId, members: [] });
    }
    groups.get(groupId)?.members.push({
      songId: Number(row.song_id),
      fileName: String(row.file_name),
      score: Number(row.score),
      rawText: String(row.raw_text),
      keptInOutput: row.kept_in_output === 1,
    });
  }

  return json({ groups: Array.from(groups.values()) });
}

async function handleDownload(token: string, env: Env): Promise<Response> {
  const record = await env.DB.prepare(
    `SELECT object_key, expires_at, upload_id FROM download_links WHERE token = ?`,
  )
    .bind(token)
    .first<Record<string, unknown>>();

  if (!record) {
    return json({ error: "Download not found" }, 404);
  }

  const expiresAt = Date.parse(String(record.expires_at));
  if (Number.isFinite(expiresAt) && Date.now() > expiresAt) {
    return json({ error: "Download link expired" }, 410);
  }

  const object = await env.SONGS_BUCKET.get(String(record.object_key));
  if (!object) {
    return json({ error: "Generated file not found" }, 404);
  }

  return new Response(object.body, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Cache-Control": "private, max-age=600",
      "Content-Disposition": `attachment; filename="deduplicated-${String(record.upload_id)}.zip"`,
    },
  });
}

async function handleKeepSong(groupId: number, songId: number, env: Env): Promise<Response> {
  const result = await keepSongInGroup(groupId, songId, env);
  if ("error" in result) {
    return json(result, 404);
  }

  return json(result, 200);
}

async function handleFinalizeUpload(uploadId: string, env: Env): Promise<Response> {
  const result = await finalizeUpload(uploadId, env);
  if ("error" in result) {
    return json(result, 400);
  }

  return json(result, 200);
}
