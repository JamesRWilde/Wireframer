import * as state from '../state/StateCpuEngineFillRenderBridge.js';

export function GetCpuEngineIsFillWorkerAvailable() {
  return state.workerAvailable && state.workerReady;
}
