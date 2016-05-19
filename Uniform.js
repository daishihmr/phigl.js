phina.namespace(function() {
  var GL = WebGLRenderingContext;

  phina.define("phigl.Uniform", {

    gl: null,
    name: null,

    texture: null,

    _location: null,
    _value: null,
    _type: null,
    _uniformMethod: null,

    init: function(gl, program, name, type) {
      this.gl = gl;
      this.name = name;

      this._location = gl.getUniformLocation(program, name);
      this._type = type;

      switch (type) {
        case GL.FLOAT:
          this._uniformMethod = "uniform1f";
          break;
        case GL.FLOAT_VEC2:
          this._uniformMethod = "uniform2fv";
          break;
        case GL.FLOAT_VEC3:
          this._uniformMethod = "uniform3fv";
          break;
        case GL.FLOAT_VEC4:
          this._uniformMethod = "uniform4fv";
          break;
        case GL.FLOAT_MAT2:
          this._uniformMethod = "uniformMatrix2fv";
          break;
        case GL.FLOAT_MAT3:
          this._uniformMethod = "uniformMatrix3fv";
          break;
        case GL.FLOAT_MAT4:
          this._uniformMethod = "uniformMatrix4fv";
          break;
        case GL.SAMPLER_2D:
          this._uniformMethod = "uniform1i";
          break;
      }
    },

    setValue: function(value) {
      this._value = value;
      return this;
    },

    setTexture: function(texture) {
      this.texture = texture;
      return this;
    },

    assign: function() {
      var gl = this.gl;

      switch (this._type) {
        case GL.FLOAT:
        case GL.FLOAT_VEC2:
        case GL.FLOAT_VEC3:
        case GL.FLOAT_VEC4:
          gl[this._uniformMethod](this._location, this._value);
          break;
        case GL.FLOAT_MAT2:
        case GL.FLOAT_MAT3:
        case GL.FLOAT_MAT4:
          gl[this._uniformMethod](this._location, false, this._value);
          break;
        case GL.SAMPLER_2D:
          if (this.texture) this.texture.bind(this._value);
          gl[this._uniformMethod](this._location, this._value);
          break;
      }

      return this;
    },

    _accessor: {
      value: {
        get: function() {
          return this._value;
        },
        set: function(v) {
          this.setValue(v);
        },
      },
    },
  });

});
