import { handleFetch, handleQueue } from "./handlers/api";
import type { Env, UploadQueueMessage } from "./types";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleFetch(request, env);
  },

  async queue(batch: MessageBatch<UploadQueueMessage>, env: Env, ctx: ExecutionContext): Promise<void> {
    return handleQueue(batch, env, ctx);
  },
};
