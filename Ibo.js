phina.namespace(function() {
  var GL = WebGLRenderingContext;

  phina.define("phigl.Ibo", {

    gl: null,
    length: 0,

    _buffer: null,

    init: function(gl) {
      this.gl = gl;
      this._buffer = gl.createBuffer();
    },

    setValue: function(data) {
      var gl = this.gl;
      gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._buffer);
      gl.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Int16Array(data), GL.STATIC_DRAW);
      gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
      this.length = data.length;
      return this;
    },

    bind: function() {
      this.gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._buffer);
      return this;
    },

    _static: {
      unbind: function(gl) {
        gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
        return this;
      },
    },

    _accessor: {
      value: {
        get: function() {
          return null;
        },
        set: function(v) {
          this.setValue(v);
        },
      },
    },
  });

});
