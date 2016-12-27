phina.namespace(function() {

  /**
   * @constructor phigl.Ibo
   * @param  {WebGLRenderingContext} gl context
   */
  phina.define("phigl.Ibo", {

    /**
     * @memberOf phigl.Ibo.prototype
     */
    gl: null,
    /**
     * @memberOf phigl.Ibo.prototype
     */
    length: 0,

    _buffer: null,

    init: function(gl) {
      this.gl = gl;
      this._buffer = gl.createBuffer();
    },

    /**
     * @memberOf phigl.Ibo.prototype
     */
    set: function(data) {
      var gl = this.gl;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      this.length = data.length;
      return this;
    },

    /**
     * @memberOf phigl.Ibo.prototype
     */
    bind: function() {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._buffer);
      return this;
    },

    /**
     * @memberOf phigl.Ibo.prototype
     */
    delete: function() {
      this.gl.deleteBuffer(this._buffer);
    },

    _static: {
      unbind: function(gl) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return this;
      },
    },

    _accessor: {
      /**
       * @memberOf phigl.Ibo.prototype
       */
      value: {
        get: function() {
          return null;
        },
        set: function(v) {
          this.set(v);
        },
      },
    },
  });

});
