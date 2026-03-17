import { workerState } from '@engine/state/render/background/worker.js';
export function postToBackgroundWorker(msg) { if (workerState.worker) workerState.worker.postMessage(msg); }
