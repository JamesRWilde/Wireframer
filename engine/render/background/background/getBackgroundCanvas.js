import { bgState } from '../backgroundState.js';

// Returns normalized canvas state used for drawing the background.
// Applies the same width/height update strategy as before (clientWidth fallback).
export function getBackgroundCanvas() {
  const canvas = bgState.canvas;
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const w = (canvas.width = canvas.clientWidth || canvas.width);
  const h = (canvas.height = canvas.clientHeight || canvas.height);
  return { canvas, ctx, w, h };
}
