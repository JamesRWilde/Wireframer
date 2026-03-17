import * as state from '../state/StateRenderEngineBackgroundWorker.js';
export function SetRenderEnginePostToBackgroundWorker(msg) { if (state.worker) state.worker.postMessage(msg); }
