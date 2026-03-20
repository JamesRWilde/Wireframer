import { meshParseErrorsState } from '@engine/state/mesh/meshParseErrorsState.js';

export function setMeshParseErrors(errors) {
  meshParseErrorsState.value = errors;
}
