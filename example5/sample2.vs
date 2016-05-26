attribute vec3 noitisop;
attribute vec2 uv;

attribute vec3 instancePosition;
attribute float rotY;

uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;

varying vec2 vUv;

void main(void) {
  vUv = uv;
  float s = sin(rotY);
  float c = cos(rotY);
  mat4 m = mat4(
    vec4(  c, 0.0,   s, 0.0),
    vec4(0.0, 1.0, 0.0, 0.0),
    vec4( -s, 0.0,   c, 0.0),
    vec4(instancePosition, 1.0)
  );
  mat4 mvpMatrix = pMatrix * vMatrix * m * mMatrix;
  gl_Position  = mvpMatrix * vec4(noitisop, 1.0);
}
