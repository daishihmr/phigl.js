attribute vec2 position;
attribute vec2 uv;

attribute float instanceActive;
attribute vec2 instanceUvMatrix0;
attribute vec2 instanceUvMatrix1;
attribute vec2 instanceUvMatrix2;
attribute vec3 instancePosition;
attribute vec2 instanceSize;
attribute vec2 cameraMatrix0;
attribute vec2 cameraMatrix1;
attribute vec2 cameraMatrix2;

uniform vec2 screenSize;

varying vec2 vUv;

void main(void) {
  if (instanceActive == 0.0) {
    vUv = uv;
    gl_Position = vec4(0.0);
  } else {
    mat3 uvm = mat3(
      vec3(instanceUvMatrix0, 0.0),
      vec3(instanceUvMatrix1, 0.0),
      vec3(instanceUvMatrix2, 1.0)
    );
    vUv = (uvm * vec3(uv, 1.0)).xy;

    mat3 cameraMatrix = mat3(
      vec3(cameraMatrix0, 0.0),
      vec3(cameraMatrix1, 0.0),
      vec3(cameraMatrix2, 1.0)
    );

    mat3 m = mat3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      instancePosition.xy, 1.0
    ) * mat3(
      instanceSize.x, 0.0, 0.0,
      0.0, instanceSize.y, 0.0,
      0.0, 0.0, 1.0
    );

    vec3 p = cameraMatrix * m * vec3(position, 1.0);
    vec3 p2 = (p + vec3(-screenSize.x * 0.5, -screenSize.y * 0.5, 0.0)) * vec3(1.0 / (screenSize.x * 0.5), -1.0 / (screenSize.y * 0.5), 0.0);
    p2.z = instancePosition.z;
    gl_Position = vec4(p2, 1.0);
  }
}
