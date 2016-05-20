phina.namespace(function() {
  var GL = WebGLRenderingContext;

  phina.define("phigl.Texture", {

    gl: null,

    _texture: null,

    init: function(gl, image) {
      this.gl = gl;
      this._texture = gl.createTexture();
      if (image) {
        this.setImage(image);
      }
    },

    setImage: function(image) {
      var gl = this.gl;

      if (typeof image === "string") {
        image = phina.asset.AssetManager.get("image", image);
      }
      gl.bindTexture(GL.TEXTURE_2D, this._texture);
      gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image.domElement);
      gl.generateMipmap(GL.TEXTURE_2D);
      gl.bindTexture(GL.TEXTURE_2D, null);

      return this;
    },

    bind: function(unitIndex) {
      var gl = this.gl;
      gl.activeTexture(GL.TEXTURE0 + (unitIndex || 0));
      gl.bindTexture(GL.TEXTURE_2D, this._texture);
      return this;
    },

    unbind: function() {
      var gl = this.gl;
      gl.bindTexture(GL.TEXTURE_2D, null);
      return this;
    },
  });

});
