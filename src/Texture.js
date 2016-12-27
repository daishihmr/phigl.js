phina.namespace(function() {

  /**
   * @constructor phigl.Texture
   * @param  {WebGLRenderingContext} gl context
   */
  phina.define("phigl.Texture", {

    /**
     * @memberOf phigl.Texture.prototype
     */
    gl: null,

    _texture: null,

    init: function(gl, image) {
      this.gl = gl;
      this._texture = gl.createTexture();
      if (image) {
        this.setImage(image);
      }
    },

    /**
     * @memberOf phigl.Texture.prototype
     */
    setImage: function(image) {
      var gl = this.gl;

      if (typeof image === "string") {
        image = phina.asset.AssetManager.get("image", image);
      }
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image.domElement);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);

      return this;
    },

    /**
     * @memberOf phigl.Texture.prototype
     */
    bind: function(unitIndex) {
      var gl = this.gl;
      gl.activeTexture(gl["TEXTURE" + (unitIndex || 0)]);
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      return this;
    },

    /**
     * @memberOf phigl.Texture.prototype
     */
    delete: function() {
      this.gl.deleteTexture(this._texture);
    },

    _static: {
      /**
       * @memberOf phigl.Texture
       */
      unbind: function(gl) {
        gl.bindTexture(gl.TEXTURE_2D, null);
        return this;
      },
    },
  });

});
