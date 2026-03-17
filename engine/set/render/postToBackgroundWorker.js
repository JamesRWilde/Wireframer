import * as statefrom '@ui/get/Read/state.js';
export function postToBackgroundWorker(msg) { if (state.worker) state.worker.postMessage(msg); }
