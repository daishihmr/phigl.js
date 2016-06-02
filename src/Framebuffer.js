phina.namespace(function() {

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

      gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

      gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthRenderbuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
      
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthRenderbuffer);

      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0);

      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },

    bind: function() {
      var gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
      return this;
    },

    _static: {
      unbind: function(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      },
    },
  });

});
