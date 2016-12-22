phina.namespace(function() {
  
  /**
   * @constructor phigl.Extensions
   */
  phina.define("phigl.Extensions", {
    
    _static: {
      
      getVertexArrayObject: function(gl) {
        return this._get(gl, "OES_vertex_array_object");
      },

      getInstancedArrays: function(gl) {
        return this._get(gl, "ANGLE_instanced_arrays");
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
