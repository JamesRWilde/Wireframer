export function convertRgbToNormalized(out, rgb, fallback) {
  const src = rgb || fallback;
  out[0] = (src?.[0] ?? 0) / 255;
  out[1] = (src?.[1] ?? 0) / 255;
  out[2] = (src?.[2] ?? 0) / 255;
  return out;
}
