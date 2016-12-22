precision mediump float;

uniform sampler2D texture;

varying vec2 vUv;

void main(void){
  gl_FragColor = texture2D(texture, vUv) * 2.0;
}
