import * as state from '../state/backgroundWorker.js';
export function postToBackgroundWorker(msg) { if (state.worker) state.worker.postMessage(msg); }
