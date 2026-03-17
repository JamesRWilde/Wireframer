import * as statefrom "@engine/state/render/background/worker.js";

export function workerTerminate() {
  if (state.worker) {
    state.worker.terminate();
    state.worker = null;
    state.workerAvailable = false;
  }
}
