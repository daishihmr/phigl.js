phina.namespace(function() {
  var i = 0;

  /**
   * @constructor phigl.Vbo
   * @param  {WebGLRenderingContext} gl context
   */
  phina.define("phigl.Vbo", {

    /**
     * @memberOf phigl.Vbo.prototype
     */
    gl: null,
    /**
     * @memberOf phigl.Vbo.prototype
     */
    usage: null,
    _vbo: null,

    /**
     * @memberOf phigl.Vbo.prototype
     */
    array: null,

    init: function(gl, usage) {
      this.gl = gl;
      this.usage = usage || gl.STATIC_DRAW;
      this._vbo = gl.createBuffer();
      this._vbo._id = i++;
    },

    /**
     * @memberOf phigl.Vbo.prototype
     */
    set: function(data) {
      var gl = this.gl;
      if (this.array) {
        this.array.set(data);
      } else {
        this.array = new Float32Array(data);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
      gl.bufferData(gl.ARRAY_BUFFER, this.array, this.usage);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return this;
    },

    /**
     * @param {Array.<object>} dataArray [{ unitSize: n, data: [number] }, ...]
     * @memberOf phigl.Vbo.prototype
     */
    setAsInterleavedArray: function(dataArray) {
      var count = dataArray[0].data.length / dataArray[0].unitSize;
      var interleavedArray = [];
      for (var i = 0; i < count; i++) {
        dataArray.forEach(function(d) {
          for (var j = 0; j < d.unitSize; j++) {
            interleavedArray.push(d.data[i * d.unitSize + j]);
          }
        });
      }
      return this.set(interleavedArray);
    },

    /**
     * @memberOf phigl.Vbo.prototype
     */
    bind: function() {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
      // console.log("bindBuffer", this._vbo, this.array.length);
      return this;
    },

    /**
     * @memberOf phigl.Vbo.prototype
     */
    delete: function() {
      this.gl.deleteBuffer(this._vbo);
    },

    _static: {
      /**
       * @memberOf phigl.Vbo
       */
      unbind: function(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        // console.log("unbind")
      },
    },

  });
});
