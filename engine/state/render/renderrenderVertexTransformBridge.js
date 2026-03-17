export let worker = null;
export let workerAvailable = false;
export let pendingFrameId = -1;
export let cachedResult = null;
export let cachedFrameId = -1;
export let errorCount = 0;
export const MAX_ERROR_LOGS = 3;
