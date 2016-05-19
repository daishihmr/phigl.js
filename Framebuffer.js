phina.namespace(function() {
  var GL = WebGLRenderingContext;

  phina.define("phigl.Framebuffer", {
    gl: null,
    texture: null,

    _framebuffer: null,
    _depthRenderbuffer: null,
    _texture: null,

    init: function(gl, width, height) {
      this.gl = gl;
      this.width = width;
      this.height = height;
      
      this.texture = phigl.Texture(gl);

      this._framebuffer = gl.createFramebuffer();
      this._depthRenderbuffer = gl.createRenderbuffer();
      this._texture = this.texture._texture;

      gl.bindFramebuffer(GL.FRAMEBUFFER, this._framebuffer);

      gl.bindRenderbuffer(GL.RENDERBUFFER, this._depthRenderbuffer);
      gl.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, width, height);

      gl.bindTexture(GL.TEXTURE_2D, this._texture);
      gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);

      gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
      gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
      gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

      gl.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this._texture, 0);

      gl.bindTexture(GL.TEXTURE_2D, null);
      gl.bindRenderbuffer(GL.RENDERBUFFER, null);
      gl.bindFramebuffer(GL.FRAMEBUFFER, null);
    },

    bind: function() {
      var gl = this.gl;
      gl.bindFramebuffer(GL.FRAMEBUFFER, this._framebuffer);
      gl.viewport(0, 0, this.width, this.height);
      return this;
    },

    unbind: function() {
      this.gl.bindFramebuffer(GL.FRAMEBUFFER, null);
      return this;
    },
  });

});
