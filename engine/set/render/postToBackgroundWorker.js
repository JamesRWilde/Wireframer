import * as statefrom '@ui/get/read/state.js';
export function postToBackgroundWorker(msg) { if (state.worker) state.worker.postMessage(msg); }
