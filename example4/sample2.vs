attribute vec3 position;
attribute vec2 uv;

uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;

varying vec2 vUv;

void main(void) {
  vUv = uv;
  mat4 mvpMatrix = pMatrix * vMatrix * mMatrix;
  gl_Position  = mvpMatrix * vec4(position, 1.0);
}
