precision mediump float;

uniform sampler2D texture;

varying vec2 vUv;

void main(void){
  vec3 result = vec3(0.0);
  const float r = 6.0;
  const float vv = 0.004;
  for (float i = -r; i < r; i++) {
    for (float j = -r; j < r; j++) {
      vec2 v = vec2(vv * i, vv * j);
      float d = length(v);
      result += vec3(texture2D(texture, vUv + v).rgb * (0.02 - d * 0.001));
    }
  }
  gl_FragColor = vec4(result, 1.0);
}
