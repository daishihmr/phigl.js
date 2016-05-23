precision mediump float;

uniform sampler2D texture;

varying vec2 vUv;
varying vec4 vColor;

void main(void){
  gl_FragColor = vColor * texture2D(texture, vUv);
}
