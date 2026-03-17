import * as state from '../state/renderEngineBackgroundWorker.js';
export function renderEnginePostToBackgroundWorker(msg) { if (state.worker) state.worker.postMessage(msg); }
