phina.namespace(function() {
  
  /**
   * GLSL Attribute variable.
   * @constructor phigl.Attribute
   * @param  {WebGLRenderingContext} gl context
   * @param  {phigl.Program} program
   * @param  {string} name
   * @param  {number} type
   */
  phina.define("phigl.Attribute", {

    gl: null,
    name: null,
    _location: null,
    _type: null,
    _ptype: null,

    init: function(gl, program, name, type) {
      this.gl = gl;
      this.name = name;

      this._location = gl.getAttribLocation(program, name);
      if (this._location == -1) {
        throw "attribute " + name + " not found";
      }
      gl.enableVertexAttribArray(this._location);

      this._type = type;
      switch (type) {
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

    /**
     * set stride and offset
     * @memberOf phigl.Attribute.prototype
     * @param  {number} stride
     * @param  {number} offset
     * @return {this}
     */
    specify: function(stride, offset) {
      // console.log("attribute", this.name, this._location);
      var gl = this.gl;
      gl.vertexAttribPointer(this._location, this.size, this._ptype, false, stride, offset);
      return this;
    },

  });

});
