phina.namespace(function() {

  phina.define("phigl.PostProcessing", {

    gl: null,
    drawer: null,

    width: 0,
    height: 0,

    init: function(gl, shader, uniforms, width, height) {
      this.gl = gl;

      if (typeof(shader) == "string") {
        shader = phigl.PostProcessing.createProgram(gl, shader);
      }
      width = width || 256;
      height = height || 256;
      uniforms = uniforms || [];

      var sqWidth = Math.pow(2, Math.ceil(Math.log2(width)));
      var sqHeight = Math.pow(2, Math.ceil(Math.log2(height)));

      this.drawer = phigl.Drawable(gl)
        .setDrawMode(gl.TRIANGLE_STRIP)
        .setProgram(shader)
        .setIndexValues([0, 1, 2, 3])
        .setAttributes("position", "uv")
        .setAttributeData([
          //
          -1, +1, 0, height / sqHeight,
          //
          +1, +1, width / sqWidth, height / sqHeight,
          //
          -1, -1, 0, 0,
          // 
          +1, -1, width / sqWidth, 0,
        ])
        .setUniforms(["texture", "canvasSize"].concat(uniforms));

      this.width = width;
      this.height = height;
      this.sqWidth = sqWidth;
      this.sqHeight = sqHeight;
    },

    render: function(texture, uniformValues) {
      var gl = this.gl;

      this.drawer.uniforms.texture.setValue(0).setTexture(texture);
      this.drawer.uniforms.canvasSize.value = [this.sqWidth, this.sqHeight];
      if (uniformValues) this.setUniforms(uniformValues);
      this.drawer.draw();

      return this;
    },

    setUniforms: function(uniformValues) {
      var uniforms = this.drawer.uniforms;
      uniformValues.forIn(function(k, v) {
        uniforms[k].value = v;
      });
    },

    calcCoord: function(x, y) {
      return [x / this.sqWidth, (this.height - y) / this.sqHeight];
    },

    _static: {
      vertexShaderSource: [
        "attribute vec2 position;",
        "attribute vec2 uv;",

        "varying vec2 vUv;",

        "void main(void) {",
        "  vUv = uv;",
        "  gl_Position = vec4(position, 0.0, 1.0);",
        "}",
      ].join("\n"),

      createProgram: function(gl, fragmentShader) {
        var vertexShader = phigl.VertexShader(gl);
        vertexShader.data = this.vertexShaderSource;

        return phigl.Program(gl)
          .attach(vertexShader)
          .attach(fragmentShader)
          .link();
      },
    },

  });

});
