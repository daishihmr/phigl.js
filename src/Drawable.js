phina.namespace(function() {

  /**
   * drawable object.
   * 
   * @constructor phigl.Drawable
   * @param  {WebGLRenderingContext} gl context
   * @param {WebGLExtension?} extVao value of gl.getExtension('OES_vertex_array_object')
   * @extends {phina.util.EventDispatcher}
   */
  phina.define("phigl.Drawable", {
    superClass: "phina.util.EventDispatcher",

    /**
     * @type {WebGLRenderingContext}
     * @memberOf phigl.Drawable.prototype
     */
    gl: null,
    /**
     * @type {WebGLExtension}
     * @memberOf phigl.Drawable.prototype
     */
    extVao: null,

    /**
     * @type {phigl.Program}
     * @memberOf phigl.Drawable.prototype
     */
    program: null,
    /**
     * @type {phigl.Ibo}
     * @memberOf phigl.Drawable.prototype
     */
    indices: null,
    /**
     * @type {Array.<phigl.Attribute>}
     * @memberOf phigl.Drawable.prototype
     */
    attributes: null,
    /**
     * @type {number}
     * @memberOf phigl.Drawable.prototype
     */
    stride: 0,
    /**
     * @type {Object.<string, phigl.Uniform>}
     * @memberOf phigl.Drawable.prototype
     */
    uniforms: null,
    /**
     * @type {phigl.Vbo}
     * @memberOf phigl.Drawable.prototype
     */
    vbo: null,
    /**
     * drawElements method 1st parameter
     * @type {number}
     * @memberOf phigl.Drawable.prototype
     */
    drawMode: 0,
    /**
     * @type {WebGLVertexArrayObjectOES}
     * @memberOf phigl.Drawable.prototype
     */
    vao: null,

    init: function(gl, extVao) {
      this.superInit();
      this.gl = gl;
      this.extVao = extVao;
      this.attributes = [];
      this.uniforms = {};
      this.drawMode = gl.TRIANGLES;
    },

    /**
     * @param {number} mode
     * @memberOf phigl.Drawable.prototype
     * @return {this}
     */
    setDrawMode: function(mode) {
      this.drawMode = mode;
      return this;
    },

    /**
     * @param {phigl.Program} program
     * @memberOf phigl.Drawable.prototype
     * @return {this}
     */
    setProgram: function(program) {
      this.program = program;
      program.use();
      this.uniforms.$extend(program._uniforms);
      return this;
    },

    /**
     * @param {Array.<number>} value
     * @memberOf phigl.Drawable.prototype
     * @return {this}
     */
    setIndexValues: function(value) {
      if (!this.indices) this.indices = phigl.Ibo(this.gl);
      this.indices.set(value);
      return this;
    },

    /**
     * @param {phigl.Ibo} ibo
     * @memberOf phigl.Drawable.prototype
     * @return {this}
     */
    setIndexBuffer: function(ibo) {
      this.indices = ibo;
      return this;
    },

    /**
     * @param {Array.<string>} names
     * @memberOf phigl.Drawable.prototype
     * @return {this}
     */
    declareAttributes: function(names) {
      names = Array.prototype.concat.apply([], arguments);

      var stride = 0;
      for (var i = 0; i < names.length; i++) {
        var attr = names[i];
        if (typeof attr === "string") attr = this.program.getAttribute(attr);
        this.attributes.push(attr);
        attr._offset = stride;
        stride += attr.size * 4;
      }
      this.stride = stride;
      return this;
    },

    setAttributes: function(names) {
      console.warn("deprecated");
      return this.declareAttributes(names);
    },

    /**
     * @param {Array.<number>} data
     * @param {number=} usage default = gl.STATIC_DRAW
     * @memberOf phigl.Drawable.prototype
     * @return {this}
     */
    setAttributeData: function(data, usage) {
      if (!this.vbo) {
        this.vbo = phigl.Vbo(this.gl, usage);
      }
      this.vbo.set(data);

      this.vbo.bind();
      var stride = this.stride;
      this.attributes.forEach(function(v, i) { v.specify(stride) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    /**
     * @param {Array.<object>} dataArray [{ unitSize: n, data: [number] }, ...]
     * @param {number=} usage default = gl.STATIC_DRAW
     * @memberOf phigl.Drawable.prototype
     * @return {this}
     */
    setAttributeDataArray: function(dataArray, usage) {
      if (!this.vbo) {
        this.vbo = phigl.Vbo(this.gl, usage);
      }
      this.vbo.setAsInterleavedArray(dataArray);

      this.vbo.bind();
      var stride = this.stride;
      this.attributes.forEach(function(v, i) { v.specify(stride) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    /**
     * @param {phigl.Vbo} vbo
     * @memberOf phigl.Drawable.prototype
     * @return {this}
     */
    setAttributeVbo: function(vbo) {
      this.vbo = vbo;

      this.vbo.bind();
      var stride = this.stride;
      this.attributes.forEach(function(v, i) { v.specify(stride) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    /**
     * @memberOf phigl.Drawable.prototype
     * @return {this}
     */
    createVao: function() {
      var gl = this.gl;
      var stride = this.stride;

      if (!this.extVao) this.extVao = phigl.Extensions.getVertexArrayObject(gl);
      if (!this.vao) this.vao = this.extVao.createVertexArrayOES();

      this.extVao.bindVertexArrayOES(this.vao);

      if (this.indices) this.indices.bind();

      if (this.vbo) this.vbo.bind();
      this.attributes.forEach(function(v, i) {
        v.specify(stride);
        gl.enableVertexAttribArray(v._location);
      });

      this.extVao.bindVertexArrayOES(null);

      phigl.Ibo.unbind(gl);
      phigl.Vbo.unbind(gl);

      return this;
    },

    /**
     * @param {Array.<string>} names
     * @memberOf phigl.Drawable.prototype
     * @return {this}
     */
    declareUniforms: function(names) {
      names = Array.prototype.concat.apply([], arguments);

      var program = this.program;
      var map = Array.prototype.reduce.call(names, function(m, name) {
        m[name] = program.getUniform(name);
        return m;
      }, {});
      this.uniforms.$extend(map);
      return this;
    },

    setUniforms: function(names) {
      console.warn("deprecated");
      return this.declareUniforms(names);
    },

    /**
     * @memberOf phigl.Drawable.prototype
     */
    draw: function() {
      // console.log("-- begin");

      var gl = this.gl;
      var ext = this.extVao;

      this.program.use();

      if (this.vao) {
        ext.bindVertexArrayOES(this.vao);
      } else {
        if (this.indices) this.indices.bind();
        if (this.vbo) this.vbo.bind();
        var stride = this.stride;
        this.attributes.forEach(function(v, i) {
          v.enable();
          v.specify(stride);
        });
      }

      this.uniforms.forIn(function(k, v) { v.assign() });

      this.flare("predraw");
      this.gl.drawElements(this.drawMode, this.indices.length, gl.UNSIGNED_SHORT, 0);
      this.flare("postdraw");

      if (this.vao) {
        ext.bindVertexArrayOES(null);
      } else {
        phigl.Ibo.unbind(gl);
        phigl.Vbo.unbind(gl);
      }

      this.attributes.forEach(function(v, i) {
        v.disable();
      });
      this.uniforms.forIn(function(k, v) { v.reassign() });

      // console.log("-- end");
    },

    delete: function() {
      var gl = this.gl;
      var ext = this.ext;

      this.program.delete();
      if (this.vao) {
        ext.deleteVertexArrayOES(this.vao);
      } else {
        this.indices.delete();
        this.vbo.delete();
      }
    },
  });

});
