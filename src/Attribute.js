phina.namespace(function() {

  phina.define("phigl.Attribute", {

    gl: null,

    _location: null,
    _type: null,

    init: function(gl, program, name) {
      this.gl = gl;
      this.name = name;

      this._location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(this._location);
      
      var info = gl.getActiveAttrib(program, this._location);
      this._type = info.type;
      switch (info.type) {
        case gl.FLOAT:
          this.size = 1;
          this._ptype = gl.FLOAT;
          break;
        case gl.FLOAT_VEC2:
          this.size = 2;
          this._ptype = gl.FLOAT;
          break;
        case gl.FLOAT_VEC3:
          this.size = 3;
          this._ptype = gl.FLOAT;
          break;
        case gl.FLOAT_VEC4:
          this.size = 4;
          this._ptype = gl.FLOAT;
          break;
      }
    },

    specify: function(stride, offset) {
      this.gl.vertexAttribPointer(this._location, this.size, this._ptype, false, stride, offset);
      return this;
    },

  });

});
