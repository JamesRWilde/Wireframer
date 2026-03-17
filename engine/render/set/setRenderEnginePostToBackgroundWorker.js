import * as state from ''../state/stateRenderEngineBackgroundWorker.js'';
export function setRenderEnginePostToBackgroundWorker(msg) { if (state.worker) state.worker.postMessage(msg); }
