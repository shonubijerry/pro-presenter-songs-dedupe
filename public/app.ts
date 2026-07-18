import {
  h,
  render,
  type ComponentChildren,
  Attributes,
  type VNode,
} from "preact";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import htm from "htm";

const html = htm.bind(h);

const MAX_MB = 50;
const POLL_INTERVAL_MS = 2500;

type UploadStatus =
  | "idle"
  | "queued"
  | "processing"
  | "review"
  | "ready"
  | "failed";

type UploadSummary = {
  status: UploadStatus;
  total_files: number;
  duplicate_groups: number;
  kept_files: number;
  error_message?: string;
};

type DownloadInfo = {
  url: string;
  expiresAt: string;
};

type DuplicateMember = {
  songId: number;
  fileName: string;
  score: number;
  rawText: string;
  keptInOutput: boolean;
};

type DuplicateGroup = {
  id: number;
  members: DuplicateMember[];
};

type ToastKind = "info" | "success" | "warning" | "error";

type Toast = {
  id: string;
  kind: ToastKind;
  message: string;
};

type UploadStatusResponse = {
  upload: UploadSummary;
  download: DownloadInfo | null;
  error?: string;
};

type DuplicateGroupsResponse = {
  groups?: DuplicateGroup[];
  error?: string;
};

type UploadResponse = {
  uploadId: string;
  error?: string;
};

const ICONS: Record<string, ReturnType<typeof html>> = {
  upload: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3l5 5h-3v6h-4V8H7l5-5zm-7 13h14v2H5v-2z" />
  </svg>`,
  sparkle: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2zm7 10l1 2.9L23 16l-3 .9L19 20l-1-3.1L15 16l3-.9L19 12z"
    />
  </svg>`,
  clock: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v5.2l3.6 2.2-.9 1.5L11 13V7h2z"
    />
  </svg>`,
  archive: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 4h16v4H4V4zm2 6h12v10H6V10zm3 2v2h6v-2H9z" />
  </svg>`,
  info: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
    />
  </svg>`,
  check: html`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20 8l-1.4-1.4-9.6 9.6z" />
  </svg>`,
};

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(0.75);
  const [autoMode, setAutoMode] = useState(true);
  const [uploadId, setUploadId] = useState("");
  const [status, setStatus] = useState(
    "Select a .zip file and start processing.",
  );
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [download, setDownload] = useState<DownloadInfo | null>(null);
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    const currentUploadId =
      new URL(window.location.href).searchParams.get("uploadId") || "";
    if (currentUploadId) {
      setUploadId(currentUploadId);
      setBusy(true);
      setStatus("Restoring upload session...");
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (uploadId) {
      url.searchParams.set("uploadId", uploadId);
    } else {
      url.searchParams.delete("uploadId");
    }
    window.history.replaceState({}, "", url);
  }, [uploadId]);

  const pushToast = useCallback((kind: ToastKind, message: string) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const canUpload = useMemo(() => {
    if (!file) {
      return false;
    }
    return file.size > 0 && file.size <= MAX_MB * 1024 * 1024;
  }, [file]);

  const fileLabel = file
    ? `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `Choose a .zip up to ${MAX_MB}MB`;

  useEffect(() => {
    if (file && file.size > MAX_MB * 1024 * 1024) {
      pushToast(
        "warning",
        `This file is larger than ${MAX_MB}MB and cannot be uploaded.`,
      );
    }
  }, [file, pushToast]);

  useEffect(() => {
    if (!uploadId) {
      return;
    }

    let timer: number | null = null;

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/uploads/${uploadId}`);
        const data = (await response.json()) as UploadStatusResponse;

        if (!response.ok) {
          setStatus(data.error || "Unable to load status.");
          return;
        }

        setSummary(data.upload);
        setDownload(data.download);

        const currentStatus = data.upload?.status;
        if (currentStatus === "queued") {
          setStatus("Queued for processing...");
          return;
        }

        if (currentStatus === "processing") {
          setStatus("Scanning and de-duplicating songs...");
          return;
        }

        if (currentStatus === "ready") {
          setStatus("Done. Download your de-duplicated archive.");
          if (timer) {
            window.clearInterval(timer);
          }
          await loadGroups(uploadId);
          setBusy(false);
          pushToast("success", "Your de-duplicated archive is ready.");
          return;
        }

        if (currentStatus === "review") {
          if (timer) {
            window.clearInterval(timer);
          }
          await loadGroups(uploadId);
          setBusy(false);
          setStatus(
            "Review selections below. You can change kept/discarded files before generating the final archive.",
          );
          pushToast(
            "info",
            "Selections are ready for review. Adjust if needed, then generate the archive.",
          );
          return;
        }

        if (currentStatus === "failed") {
          const message = data.upload?.error_message || "Processing failed.";
          setStatus(message);
          if (timer) {
            window.clearInterval(timer);
          }
          setBusy(false);
          pushToast("error", message);
        }
      } catch {
        setStatus("Network issue while polling status.");
      }
    };

    void poll();
    timer = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [uploadId, pushToast]);

  const loadGroups = useCallback(async (nextUploadId: string) => {
    if (!nextUploadId) {
      setGroups([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/duplicates?uploadId=${encodeURIComponent(nextUploadId)}`,
      );
      const data = (await response.json()) as DuplicateGroupsResponse;
      if (response.ok) {
        setGroups(data.groups || []);
      }
    } catch {
      setGroups([]);
    }
  }, []);

  const submit = useCallback(
    async (event: Event) => {
      event.preventDefault();
      if (!file || !canUpload) {
        setStatus("Please select a valid zip file up to 50MB.");
        return;
      }

      setBusy(true);
      setGroups([]);
      setSummary(null);
      setDownload(null);
      setStatus("Uploading zip to worker API...");

      try {
        const body = new FormData();
        body.set("file", file);
        body.set("threshold", String(threshold));
        body.set("autoMode", String(autoMode));

        const response = await fetch("/api/uploads", {
          method: "POST",
          body,
        });
        const data = (await response.json()) as UploadResponse;

        if (!response.ok || !data.uploadId) {
          const message = data.error || "Upload failed.";
          setStatus(message);
          setBusy(false);
          pushToast("error", message);
          return;
        }

        setUploadId(data.uploadId);
        setStatus("Upload complete, waiting for processing...");
        pushToast(
          "info",
          "Upload received. Processing will continue in the background.",
        );
      } catch {
        setStatus("Upload failed due to network error.");
        setBusy(false);
        pushToast("error", "Upload failed due to network error.");
      }
    },
    [autoMode, canUpload, file, pushToast, threshold],
  );

  const keepOne = useCallback(
    async (groupId: number, songId: number) => {
      try {
        const response = await fetch(`/api/groups/${groupId}/keep/${songId}`, {
          method: "POST",
        });
        const data = (await response.json()) as {
          keptFiles?: number;
          error?: string;
        };
        if (!response.ok) {
          pushToast("error", data.error || "Failed to mark song as kept.");
          return;
        }
        await loadGroups(uploadId);
        if (typeof data.keptFiles === "number") {
          setSummary((current) =>
            current
              ? {
                  ...current,
                  ...(data.keptFiles ? { kept_files: data.keptFiles } : {}),
                }
              : current,
          );
        }
        pushToast(
          "success",
          "Song marked as kept. Others in this group will be excluded.",
        );
      } catch {
        pushToast("error", "Network error while saving choice.");
      }
    },
    [loadGroups, pushToast, uploadId],
  );

  const finalize = useCallback(async () => {
    if (!uploadId) return;
    setFinalizing(true);
    try {
      const response = await fetch(`/api/uploads/${uploadId}/finalize`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        token?: string;
        url?: string;
        expiresAt?: string;
        error?: string;
      };
      if (!response.ok || !data.url) {
        pushToast("error", data.error || "Finalize failed.");
        return;
      }
      setDownload({
        url: data.url,
        expiresAt:
          data.expiresAt || new Date(Date.now() + 7 * 86400_000).toISOString(),
      });
      setStatus("Done. Download your de-duplicated archive.");
      pushToast("success", "Archive generated. Download is ready.");
      // Refresh summary to show updated counts
      const statusResp = await fetch(`/api/uploads/${uploadId}`);
      const statusData = (await statusResp.json()) as {
        upload?: UploadSummary;
      };
      if (statusData.upload) setSummary(statusData.upload);
    } catch {
      pushToast("error", "Network error during finalize.");
    } finally {
      setFinalizing(false);
    }
  }, [uploadId, pushToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const copyDownloadLink = useCallback(async () => {
    if (!download?.url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${download.url}`,
      );
      pushToast("success", "Download link copied to clipboard.");
    } catch {
      pushToast("error", "Could not copy the link. Please copy it manually.");
    }
  }, [download, pushToast]);

  return html`
    <main className="shell">
      <div className="backdrop backdrop-a"></div>
      <div className="backdrop backdrop-b"></div>

      <section className="hero panel">
        <div className="hero-copy">
          <p className="eyebrow">Cloudflare Worker + D1</p>
          <h1>Song de-duplication, designed for quick review.</h1>
          <p className="hero-text">
            Upload a zip once, process it in the background, and return later
            for a clean, shareable download link.
          </p>
          <div className="feature-row">
            <span className="chip">${ICONS.upload} 50MB upload cap</span>
            <span className="chip">${ICONS.sparkle} Background scan</span>
            <span className="chip">${ICONS.archive} Download link</span>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-top">
            <span className="status-dot"></span>
            <span>Free-tier friendly workflow</span>
          </div>
          <p>
            The worker keeps storage lean, removes the uploaded archive after
            processing, and retains only the data needed to reconstruct the
            output.
          </p>
        </div>
      </section>

      <section className="grid-layout">
        <section className="panel uploader">
          <div className="panel-head">
            <div>
              <h2>Upload archive</h2>
              <p>
                Use a single zip file. The worker processes it asynchronously.
              </p>
            </div>
            <span
              className="hint"
              title="This keeps the app within Cloudflare free-tier limits."
              >${ICONS.info}</span
            >
          </div>

          <form onSubmit=${submit}>
            <label className="field file-field">
              <span>ZIP archive</span>
              <div className="file-picker ${file ? "has-file" : ""}">
                <input
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onChange=${(event: Event) => {
                    const target = event.target as HTMLInputElement;
                    setFile(target.files?.[0] ?? null);
                  }}
                  disabled=${busy}
                />
                <div className="file-meta">
                  <strong>${fileLabel}</strong>
                  <span
                    >${file
                      ? "Ready to upload"
                      : "Choose a zip file from your device"}</span
                  >
                </div>
              </div>
            </label>

            <label className="field">
              <div className="field-label-row">
                <span>Duplicate threshold</span>
                <span className="value-pill"
                  >${(threshold * 100).toFixed(0)}%</span
                >
              </div>
              <input
                type="range"
                min="0.4"
                max="0.98"
                step="0.01"
                value=${threshold}
                onInput=${(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  setThreshold(Number(target.value));
                }}
                disabled=${busy}
              />
            </label>

            <div className="actions-row">
              <button
                className="btn btn-primary"
                type="submit"
                disabled=${busy || !canUpload}
              >
                ${busy
                  ? html`${ICONS.clock} Processing`
                  : html`${ICONS.upload} Upload and process`}
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick=${() => void loadGroups(uploadId)}
                disabled=${!uploadId || busy}
              >
                Refresh results
              </button>
            </div>

            <label className="field toggle-field">
              <input
                type="checkbox"
                checked=${autoMode}
                onChange=${(e: Event) =>
                  setAutoMode((e.target as HTMLInputElement).checked)}
                disabled=${busy}
              />
              <span>Auto-select duplicates on upload</span>
              <small
                >When checked, best matches are preselected but you can still
                change them before finalizing</small
              >
            </label>
          </form>

          <div className="status-strip">
            <span className=${`status-badge ${summary?.status || "idle"}`}
              >${summary?.status || "idle"}</span
            >
            <p className="status">${status}</p>
          </div>
        </section>

        <aside className="panel steps-card">
          <h2>How it works</h2>
          <ol className="steps">
            <li>${ICONS.upload}<span>Upload one zip with your songs.</span></li>
            <li>
              ${ICONS.sparkle}<span
                >Worker queues and scans it in the background.</span
              >
            </li>
            <li>
              ${ICONS.check}<span
                >Download the deduplicated zip from a timed link.</span
              >
            </li>
          </ol>
        </aside>
      </section>

      ${summary
        ? html`
            <section className="panel metrics">
              <article>
                <strong>${summary.total_files || 0}</strong>
                <span>Total files</span>
              </article>
              <article>
                <strong>${summary.duplicate_groups || 0}</strong>
                <span>Duplicate groups</span>
              </article>
              <article>
                <strong>${summary.kept_files || 0}</strong>
                <span>Files kept</span>
              </article>
              <article>
                <strong>${summary.status}</strong>
                <span>Processing state</span>
              </article>
            </section>
          `
        : null}
      ${download
        ? html`
            <section className="panel download">
              <div className="panel-head">
                <div>
                  <h2>De-duplicated archive ready</h2>
                  <p>
                    Download link expires on
                    ${new Date(download.expiresAt).toLocaleString()}.
                  </p>
                </div>
                <span
                  className="hint"
                  title="This link is safe to revisit until it expires."
                  >${ICONS.info}</span
                >
              </div>
              <div className="download-actions">
                <a href=${download.url} className="btn btn-primary"
                  >${ICONS.archive} Download zip</a
                >
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick=${copyDownloadLink}
                >
                  Copy link
                </button>
              </div>
            </section>
          `
        : null}
      ${summary?.status === "review"
        ? html`
            <section className="panel review-cta">
              <div>
                <h2>
                  ${groups.length > 0
                    ? "Review complete?"
                    : "No duplicates found"}
                </h2>
                <p>
                  ${groups.length > 0
                    ? "Review preselected choices or adjust them, then generate the deduplicated archive."
                    : "This upload reached manual review mode, but no duplicate groups were detected above the current threshold. You can generate the archive as-is."}
                </p>
              </div>
              <button
                className="btn btn-primary"
                type="button"
                onClick=${finalize}
                disabled=${finalizing}
              >
                ${finalizing
                  ? html`${ICONS.clock} Generating…`
                  : html`${ICONS.archive} Generate download`}
              </button>
            </section>
          `
        : null}
      ${groups.length > 0
        ? html`
            <section className="panel groups">
              <div className="panel-head">
                <div>
                  <h2>Duplicate groups</h2>
                  <p>
                    ${summary?.status === "review"
                      ? "Choose which file to keep in each group. Others will be excluded from the download."
                      : "Sorted by similarity. The first file in each group was kept automatically."}
                  </p>
                </div>
              </div>
              <div className="group-list">
                ${groups.map(
                  (group) => html`
                    <article className="group-card" key=${group.id}>
                      <div className="group-card-head">
                        <h3>Group ${group.id}</h3>
                        <span>${group.members.length} files</span>
                      </div>
                      <div className="member-grid">
                        ${group.members.map((member) => {
                          const groupHasSelection =
                            summary?.status === "review" &&
                            group.members.some((entry) => entry.keptInOutput);
                          const reviewState =
                            summary?.status === "review"
                              ? member.keptInOutput
                                ? "selected"
                                : groupHasSelection
                                  ? "discarded"
                                  : "pending"
                              : member.keptInOutput
                                ? "kept"
                                : "discarded";

                          return html`
                            <div
                              className=${`member-card ${reviewState}`}
                              key=${member.songId}
                            >
                              <div className="member-header">
                                <strong className="name"
                                  >${member.fileName}</strong
                                >
                                <span className="score"
                                  >${Math.round(member.score * 100)}%</span
                                >
                              </div>
                              ${summary?.status === "review"
                                ? html`
                                    <div className="member-state-row">
                                      ${member.keptInOutput
                                        ? html`<span className="kept-label"
                                            >${ICONS.check} Selected to
                                            keep</span
                                          >`
                                        : groupHasSelection
                                          ? html`<span className="removed-label"
                                              >Will be discarded</span
                                            >`
                                          : html`<span className="pending-label"
                                              >Awaiting your choice</span
                                            >`}
                                    </div>
                                  `
                                : null}
                              <pre className="member-text">
${member.rawText}</pre
                              >
                              ${summary?.status === "review"
                                ? html`
                                    <button
                                      className="btn btn-keep"
                                      type="button"
                                      onClick=${() =>
                                        void keepOne(group.id, member.songId)}
                                      disabled=${member.keptInOutput}
                                    >
                                      ${member.keptInOutput
                                        ? html`${ICONS.check} Selected`
                                        : groupHasSelection
                                          ? "Keep instead"
                                          : html`${ICONS.check} Keep this one`}
                                    </button>
                                  `
                                : member.keptInOutput
                                  ? html`<span className="kept-label"
                                      >${ICONS.check} Kept</span
                                    >`
                                  : html`<span className="removed-label"
                                      >Excluded</span
                                    >`}
                            </div>
                          `;
                        })}
                      </div>
                    </article>
                  `,
                )}
              </div>
            </section>
          `
        : null}

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        ${toasts.map(
          (toast) => html`
            <div className=${`toast ${toast.kind}`} key=${toast.id}>
              <div className="toast-mark">
                ${toast.kind === "success"
                  ? ICONS.check
                  : toast.kind === "warning"
                    ? ICONS.info
                    : ICONS.sparkle}
              </div>
              <p>${toast.message}</p>
              <button
                className="toast-close"
                type="button"
                onClick=${() => removeToast(toast.id)}
                aria-label="Dismiss toast"
              >
                ×
              </button>
            </div>
          `,
        )}
      </div>
    </main>
  `;
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing #root element");
}

render(html`<${App} />`, root);
