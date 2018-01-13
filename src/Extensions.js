phina.namespace(function() {

  /**
   * @constructor phigl.Extensions
   */
  phina.define("phigl.Extensions", {

    _static: {

      extVao: null,
      extInstancedArray: null,

      getVertexArrayObject: function(gl) {
        if (this.extVao == null) {
          this.extVao = this._get(gl, "OES_vertex_array_object");
        }
        return this.extVao;
      },

      getInstancedArrays: function(gl) {
        if (this.extInstancedArray == null) {
          this.extInstancedArray = this._get(gl, "ANGLE_instanced_arrays");
        }
        return this.extInstancedArray;
      },

      _get: function(gl, name) {
        var ext = gl.getExtension(name);
        if (ext) {
          return ext;
        } else {
          throw name + " is not supported";
        }
      }
    },

  });

});