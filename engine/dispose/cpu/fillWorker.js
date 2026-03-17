import { fillState } from "@engine/state/cpu/fillRenderBridge.js";

export function fillWorker() {
  if (fillState.worker) {
    fillState.worker.terminate();
    fillState.worker = null;
    fillState.workerReady = false;
    fillState.workerAvailable = false;
  }
  if (fillState.cachedImageBitmap) {
    fillState.cachedImageBitmap.close();
    fillState.cachedImageBitmap = null;
  }
  fillState.offscreenCanvas = null;
}
