import * as state from './backgroundWorkerState.js';
export function postToBackgroundWorker(msg) { if (state.worker) state.worker.postMessage(msg); }
