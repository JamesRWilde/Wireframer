"use strict";

import { getCachedColorRgb } from '@engine/set/render/draw/getCachedColorRgb.js';

const spriteCache = new Map();

export function getParticleSprite(color) {
  const cacheKey = color;
  if (spriteCache.has(cacheKey)) {
    return spriteCache.get(cacheKey);
  }

  const [r, g, b] = getCachedColorRgb(color);
  const size = 64;
  const radius = 32;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gradient.addColorStop(0.45, `rgba(${r},${g},${b},0.36)`);
  gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  spriteCache.set(cacheKey, canvas);
  return canvas;
}
