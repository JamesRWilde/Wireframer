import * as state from '../state/renderBackgroundWorkerState.js';
export function setRenderPostToBackgroundWorker(msg) { if (state.worker) state.worker.postMessage(msg); }
