precision mediump float;

uniform sampler2D textureA;
uniform sampler2D textureB;

varying vec2 vUv;

void main(void){
  gl_FragColor = texture2D(textureA, vUv) + texture2D(textureB, vUv);
}
