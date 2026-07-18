import { Unzip, UnzipInflate, Zip, ZipPassThrough } from "fflate";
import { buildFeature } from "./similarity";
import type { SongFeature } from "../types";

export async function extractSongFeatures(zipStream: ReadableStream<Uint8Array>): Promise<SongFeature[]> {
  const features: SongFeature[] = [];

  await streamZipEntries(zipStream, async (entryName, chunks) => {
    const normalized = normalizeEntryName(entryName);
    if (!isSongEntry(normalized)) {
      return;
    }

    const text = decodeUtf8(chunks);
    features.push(buildFeature(normalized, text));
  });

  return features;
}

export async function streamDeduplicatedZip(
  sourceZip: ReadableStream<Uint8Array>,
  keepSet: Set<string>,
): Promise<ReadableStream<Uint8Array>> {
  const transform = new TransformStream<Uint8Array, Uint8Array>();
  const writer = transform.writable.getWriter();
  let writeQueue = Promise.resolve();

  let completed = false;
  let pendingEntries = 0;
  let sourceConsumed = false;

  const closeIfFinished = async (): Promise<void> => {
    if (!completed && sourceConsumed && pendingEntries === 0) {
      completed = true;
      await writeQueue;
      await writer.close();
    }
  };

  const zip = new Zip((error, chunk, final) => {
    if (error) {
      throw error;
    }
    if (chunk && chunk.length > 0) {
      writeQueue = writeQueue.then(() => writer.write(chunk));
    }
    if (final) {
      void closeIfFinished();
    }
  });

  await streamZipEntries(sourceZip, async (entryName, chunks) => {
    const normalizedName = normalizeEntryName(entryName);
    if (!isSongEntry(normalizedName) || !keepSet.has(normalizedName)) {
      return;
    }

    pendingEntries += 1;
    const file = new ZipPassThrough(normalizedName);
    zip.add(file);

    for (let i = 0; i < chunks.length; i += 1) {
      const isLastChunk = i === chunks.length - 1;
      file.push(chunks[i], isLastChunk);
    }

    if (chunks.length === 0) {
      file.push(new Uint8Array(), true);
    }

    pendingEntries -= 1;
  });

  sourceConsumed = true;
  zip.end();
  await closeIfFinished();

  return transform.readable;
}

async function streamZipEntries(
  zipStream: ReadableStream<Uint8Array>,
  onEntry: (entryName: string, chunks: Uint8Array[]) => Promise<void> | void,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const pending: Promise<void>[] = [];
    let sourceEnded = false;
    let inFlightFiles = 0;

    const finishIfDone = (): void => {
      if (sourceEnded && inFlightFiles === 0) {
        Promise.all(pending)
          .then(() => resolve())
          .catch((error) => reject(error));
      }
    };

    const unzip = new Unzip((file) => {
      inFlightFiles += 1;
      const chunks: Uint8Array[] = [];

      file.ondata = (error, data, final) => {
        if (error) {
          reject(error);
          return;
        }

        if (data && data.length > 0) {
          chunks.push(data);
        }

        if (final) {
          const task = Promise.resolve(onEntry(file.name, chunks));
          pending.push(task);
          inFlightFiles -= 1;
          finishIfDone();
        }
      };

      file.start();
    });

    unzip.register(UnzipInflate);
    (async () => {
      const reader = zipStream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          unzip.push(new Uint8Array(), true);
          sourceEnded = true;
          finishIfDone();
          return;
        }

        if (value && value.length > 0) {
          unzip.push(value, false);
        }
      }
    })().catch(reject);
  });
}

function normalizeEntryName(entryName: string): string {
  return entryName.replace(/^\/+/, "").replace(/\\/g, "/");
}

/** Returns false for macOS resource-fork entries and non-txt files. */
function isSongEntry(normalizedName: string): boolean {
  const lower = normalizedName.toLowerCase();
  if (!lower.endsWith(".txt")) {
    return false;
  }
  const base = normalizedName.split("/").pop() ?? "";
  return !normalizedName.startsWith("__MACOSX/") && !base.startsWith("._");
}

function decodeUtf8(chunks: Uint8Array[]): string {
  const totalLength = chunks.reduce((sum, item) => sum + item.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}
