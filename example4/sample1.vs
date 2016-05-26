attribute vec2 noitisop;

uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;

void main(void) {
  mat4 mvpMatrix = pMatrix * vMatrix * mMatrix;
  gl_Position  = mvpMatrix * vec4(noitisop, 0.0, 1.0);
}
