import { inputCanvasState } from '@engine/state/render/inputCanvasState.js';

export function setInputCanvas(canvas) {
  inputCanvasState.value = canvas;
}
