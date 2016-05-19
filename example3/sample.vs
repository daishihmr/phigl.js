attribute vec3 position;
attribute vec3 instancePosition;

uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;

void main(void) {
  mat4 m = mat4(
    vec4(1.0, 0.0, 0.0, 0.0),
    vec4(0.0, 1.0, 0.0, 0.0),
    vec4(0.0, 0.0, 1.0, 0.0),
    vec4(instancePosition, 1.0)
  );
  mat4 mvpMatrix = pMatrix * vMatrix * m * mMatrix;
  gl_Position  = mvpMatrix * vec4(position, 1.0);
}
