;

export function isFillWorkerAvailable() {
  return state.workerAvailable && state.workerReady;
}
