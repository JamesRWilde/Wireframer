import { meshParseErrorsState } from '@engine/state/mesh/meshParseErrorsState.js';

export function getMeshParseErrors() {
  return meshParseErrorsState.value;
}
