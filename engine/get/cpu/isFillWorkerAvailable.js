import { fillState } from "@engine/state/cpu/fillRenderBridge.js";

export function isFillWorkerAvailable() {
  return fillState.workerAvailable && fillState.workerReady;
}
