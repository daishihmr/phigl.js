attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 mvpMatrix;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
uniform vec4 diffuseColor;
uniform vec4 ambientColor;

varying vec2 vUv;
varying vec4 vColor;

void main(void) {
  vUv = uv;

  vec3 invLight = normalize(invMatrix * vec4(-lightDirection, 0.0)).xyz;
  float diffuse = clamp(dot(normal, invLight), 0.0, 1.0);
  vColor = diffuseColor * vec4(vec3(diffuse), 1.0) + ambientColor;
  gl_Position = mvpMatrix * vec4(position, 1.0);
}
