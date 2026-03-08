// Fragment shader for background particles
// Renders particles as soft glowing circles

precision highp float;

varying float vAlpha;
varying vec3 vColor;

void main() {
  // For gl.POINTS approach, calculate distance from center
  // vec2 coord = gl_PointCoord - vec2(0.5);
  // float dist = length(coord);
  // if (dist > 0.5) discard; // Circle shape

  // Soft edge falloff
  // float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, dist));

  // For quad rendering (our approach), we draw full quads with circular alpha in vertex shader
  // But we're using simple quads per particle, so just output color with alpha
  gl_FragColor = vec4(vColor, vAlpha);
}
