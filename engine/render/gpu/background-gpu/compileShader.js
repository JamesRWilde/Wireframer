/**
 * compileShader.js - Compile a WebGL shader and check for errors
 *
 * PURPOSE:
 *   Compiles a WebGL shader of the given type (vertex or fragment) from GLSL source code.
 *   Ensures robust error handling and resource cleanup. Used by GPU background renderer setup and any
 *   code that needs to dynamically build WebGL shader programs.
 *
 * PARAMETERS:
 *   @param {WebGLRenderingContext} gl - The WebGL context to use. Must be a valid, initialized context.
 *     - Should be either WebGLRenderingContext or WebGL2RenderingContext.
 *     - The context must not be lost or destroyed.
 *   @param {number} type - Shader type constant: gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
 *     - Passing any other value will result in undefined behavior or errors.
 *   @param {string} source - The GLSL source code for the shader.
 *     - Should be valid GLSL ES 1.0/3.0 depending on context.
 *     - Syntax errors or unsupported features will cause compilation to fail.
 *
 * RETURNS:
 *   @returns {WebGLShader} The compiled shader object, ready to be attached to a program.
 *
 * THROWS:
 *   @throws {Error} If shader compilation fails. The error message will include the shader info log
 *   for easier debugging. The shader object is deleted before throwing to avoid resource leaks.
 *
 * USAGE EXAMPLE:
 *   const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
 *   const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
 *   // Attach to program, link, etc.
 *
 * NOTES:
 *   - Always check the returned shader is not null before using.
 *   - This function does not attach the shader to a program or link it; it only compiles.
 *   - Compilation errors are common when porting GLSL between platforms or WebGL versions.
 *   - For debugging, inspect the error message for line numbers and GLSL errors.
 *
 * MAINTAINER GUIDELINES:
 *   - Keep this function as a single-purpose utility: compile and validate a shader.
 *   - Do not add program linking or attribute/uniform setup here.
 *   - Always update comments and usage notes if WebGL versions or error handling changes.
 */
export function compileShader(gl, type, source) {
  // Create a new shader object of the specified type (vertex or fragment).
  // This allocates a GPU resource; must be deleted if not used.
  const shader = gl.createShader(type);
  // Attach the provided GLSL source code to the shader object.
  gl.shaderSource(shader, source);
  // Compile the shader source code. Compilation is asynchronous on some platforms.
  gl.compileShader(shader);

  // Check if the shader compiled successfully by querying the compile status.
  // If compilation failed, retrieve the error log for debugging.
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Get the detailed info log from the shader object (may include line numbers and errors).
    const info = gl.getShaderInfoLog(shader);
    // Clean up the shader object to avoid memory/resource leaks.
    gl.deleteShader(shader);
    // Throw an error with the shader info log for easier diagnosis by the caller.
    throw new Error(`Background GPU shader compile failed: ${info}`);
  }

  // Return the compiled shader object to be attached to a program.
  // The caller is responsible for attaching and linking.
  return shader;
}
