phina.namespace(function() {

  /**
   * @constructor phigl.Uniform
   * @param  {WebGLRenderingContext} gl context
   */
  phina.define("phigl.Uniform", {

    /**
     * @memberOf phigl.Uniform.prototype
     */
    gl: null,
    /**
     * @memberOf phigl.Uniform.prototype
     */
    name: null,

    /**
     * @memberOf phigl.Uniform.prototype
     */
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
        case gl.FLOAT:
          this._uniformMethod = "uniform1f";
          break;
        case gl.FLOAT_VEC2:
          this._uniformMethod = "uniform2fv";
          break;
        case gl.FLOAT_VEC3:
          this._uniformMethod = "uniform3fv";
          break;
        case gl.FLOAT_VEC4:
          this._uniformMethod = "uniform4fv";
          break;
        case gl.FLOAT_MAT2:
          this._uniformMethod = "uniformMatrix2fv";
          break;
        case gl.FLOAT_MAT3:
          this._uniformMethod = "uniformMatrix3fv";
          break;
        case gl.FLOAT_MAT4:
          this._uniformMethod = "uniformMatrix4fv";
          break;
        case gl.SAMPLER_2D:
          this._uniformMethod = "uniform1i";
          break;
      }
    },

    /**
     * @memberOf phigl.Uniform.prototype
     */
    setValue: function(value) {
      this._value = value;
      return this;
    },

    /**
     * @memberOf phigl.Uniform.prototype
     */
    setTexture: function(texture) {
      if (typeof(texture) == "string") {
        texture = phigl.Texture(this.gl, texture);
      }
      this.texture = texture;
      return this;
    },

    /**
     * @memberOf phigl.Uniform.prototype
     */
    assign: function() {
      var gl = this.gl;

      switch (this._type) {
        case gl.FLOAT:
        case gl.FLOAT_VEC2:
        case gl.FLOAT_VEC3:
        case gl.FLOAT_VEC4:
          gl[this._uniformMethod](this._location, this._value);
          break;
        case gl.FLOAT_MAT2:
        case gl.FLOAT_MAT3:
        case gl.FLOAT_MAT4:
          gl[this._uniformMethod](this._location, false, this._value);
          break;
        case gl.SAMPLER_2D:
          if (this.texture) this.texture.bind(this._value);
          gl[this._uniformMethod](this._location, this._value);
          break;
      }

      return this;
    },

    /**
     * @memberOf phigl.Uniform.prototype
     */
    reassign: function() {
      var gl = this.gl;

      switch (this._type) {
        case gl.SAMPLER_2D:
          if (this.texture) phigl.Texture.unbind(gl);
          break;
      }

      return this;
    },

    _accessor: {
      /**
       * @memberOf phigl.Uniform.prototype
       */
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
