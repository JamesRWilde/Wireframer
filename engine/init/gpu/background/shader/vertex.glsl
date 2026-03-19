// Vertex shader for background particles
// Renders particles as screen-space quads with point size

precision highp float;

// Particle data: x, y, size, alpha (all in pixels/units)
attribute vec4 aParticle; // x, y, size, alpha

// Uniforms
uniform vec2 uResolution; // Canvas width, height
uniform vec3 uColor;      // Particle color (RGB 0-1)
uniform float uOpacity;   // Global opacity multiplier

// Varyings to fragment shader
varying float vAlpha;
varying vec3 vColor;

void main() {
  // Convert particle position to clip space (-1 to 1)
  // Canvas coordinates: (0,0) top-left, (w,h) bottom-right
  // Clip space: (-1,-1) bottom-left, (1,1) top-right
  vec2 clipPos = (aParticle.xy / uResolution) * 2.0 - 1.0;
  // Flip Y because canvas Y goes down but clip space Y goes up
  clipPos.y = -clipPos.y;

  gl_Position = vec4(clipPos, 0.0, 1.0);

  // Point size for gl.POINTS rendering (alternative approach)
  // gl_PointSize = aParticle.z;

  // Pass color and alpha to fragment shader
  vColor = uColor;
  vAlpha = aParticle.w * uOpacity;
}
