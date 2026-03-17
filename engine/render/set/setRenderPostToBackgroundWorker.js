import * as state from '../renderBackgroundWorkerState.js';
export function setRenderPostToBackgroundWorker(msg) { if (state.worker) state.worker.postMessage(msg); }
