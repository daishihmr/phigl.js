phina.namespace(function() {

  /**
   * GLSL Attribute variable.
   * @constructor phigl.Detector
   */
  phina.define("phigl.Detector", {
    _static: {
      
      /**
       * @memberOf phigl.Detector
       * @property {boolean}
       */
      isEnable: (function() {
        try {
          var canvas = document.createElement('canvas');
          var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          return !!(window.WebGLRenderingContext && gl && gl.getShaderPrecisionFormat);
        } catch (e) {
          return false;
        }
      })(),
    },
  });

});
