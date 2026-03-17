import * as statefrom "@engine/state/render/background/worker.js";

export function isFillWorkerAvailable() {
  return state.workerAvailable && state.workerReady;
}
