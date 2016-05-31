phina.namespace(function() {

  phina.define("phigl.Ibo", {

    gl: null,
    length: 0,

    _buffer: null,

    init: function(gl) {
      this.gl = gl;
      this._buffer = gl.createBuffer();
    },

    set: function(data) {
      var gl = this.gl;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      this.length = data.length;
      return this;
    },

    bind: function() {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._buffer);
      return this;
    },

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
