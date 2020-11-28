phina.namespace(function() {

  /**
   * @constructor phigl.Framebuffer
   * @param  {WebGLRenderingContext} gl context
   * @param {number} width
   * @param {number} height
   */
  phina.define("phigl.Framebuffer", {
    gl: null,
    
    /**
     * @type {phigl.Texture}
     * @memberOf phigl.Framebuffer.prototype
     */
    texture: null,

    _framebuffer: null,
    _depthRenderbuffer: null,
    _texture: null,

    init: function(gl, width, height, options) {
      options = options || {};

      this.gl = gl;
      this.width = width;
      this.height = height;

      this._framebuffer = gl.createFramebuffer();

      gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

      // depth_stencil
      this._depthStencilRenderbuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthStencilRenderbuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilRenderbuffer);

      // // stencil
      // this._stencilRenderbuffer = gl.createRenderbuffer();
      // gl.bindRenderbuffer(gl.RENDERBUFFER, this._stencilRenderbuffer);
      // gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, width, height);
      // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._stencilRenderbuffer);

      // color
      this.texture = phigl.Texture(gl);
      this._texture = this.texture._texture;
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.magFilter || gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.minFilter || gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0);

      // reset
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },

    /**
     * @memberOf phigl.Framebuffer.prototype
     * @return {this}
     */
    bind: function() {
      var gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
      gl.viewport(0, 0, this.width, this.height);
      return this;
    },

    delete: function() {
      var gl = this.gl;
      gl.deleteFramebuffer(this._framebuffer);
      gl.deleteRenderbuffer(this._depthStencilRenderbuffer);
      this.texture.delete();
    },

    _static: {
      /**
       * @memberOf phigl.Framebuffer
       * @param  {WebGLRenderingContext} gl context
       */
      unbind: function(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      },
    },
  });

});
