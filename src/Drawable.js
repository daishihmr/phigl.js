phina.namespace(function() {

  phina.define("phigl.Drawable", {
    superClass: "phina.util.EventDispatcher",

    gl: null,
    extVao: null,

    program: null,
    indices: null,
    attributes: null,
    stride: 0,
    offsets: null,
    uniforms: null,
    vbo: null,
    drawMode: 0,
    vao: null,

    init: function(gl, extVao) {
      this.superInit();
      this.gl = gl;
      this.extVao = extVao;
      this.attributes = [];
      this.offsets = [];
      this.uniforms = {};
      this.drawMode = gl.TRIANGLES;
    },

    setDrawMode: function(mode) {
      this.drawMode = mode;
      return this;
    },

    setProgram: function(program) {
      this.program = program;
      program.use();
      return this;
    },

    setIndexValues: function(value) {
      if (!this.indices) this.indices = phigl.Ibo(this.gl);
      this.indices.setValue(value);
      return this;
    },

    setAttributes: function(names) {
      names = Array.prototype.concat.apply([], arguments);

      var stride = 0;
      for (var i = 0; i < names.length; i++) {
        var attr = names[i];
        if (typeof attr === "string") attr = this.program.getAttribute(attr);
        this.attributes.push(attr);
        this.offsets.push(stride);
        stride += attr.size * 4;
      }
      this.stride = stride;
      return this;
    },

    setAttributeData: function(data, usage) {
      if (!this.vbo) {
        this.vbo = phigl.Vbo(this.gl, usage);
      }
      this.vbo.set(data);

      this.vbo.bind();
      var stride = this.stride;
      var offsets = this.offsets;
      this.attributes.forEach(function(v, i) { v.specify(stride, offsets[i]) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    setAttributeDataArray: function(dataArray, usage) {
      if (!this.vbo) {
        this.vbo = phigl.Vbo(this.gl, usage);
      }
      this.vbo.setAsInterleavedArray(dataArray);

      this.vbo.bind();
      var stride = this.stride;
      var offsets = this.offsets;
      this.attributes.forEach(function(v, i) { v.specify(stride, offsets[i]) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    createVao: function() {
      var gl = this.gl;
      var stride = this.stride;
      var offsets = this.offsets;

      if (!this.extVao) this.extVao = phigl.Extensions.getVertexArrayObject(gl);
      if (!this.vao) this.vao = this.extVao.createVertexArrayOES();

      this.extVao.bindVertexArrayOES(this.vao);

      if (this.indices) this.indices.bind();

      if (this.vbo) this.vbo.bind();
      this.attributes.forEach(function(v, i) {
        v.specify(stride, offsets[i]);
        gl.enableVertexAttribArray(v._location);
      });

      this.extVao.bindVertexArrayOES(null);

      phigl.Ibo.unbind(gl);
      phigl.Vbo.unbind(gl);

      return this;
    },

    setUniforms: function(names) {
      names = Array.prototype.concat.apply([], arguments);

      var program = this.program;
      var map = Array.prototype.reduce.call(names, function(m, name) {
        m[name] = program.getUniform(name);
        return m;
      }, {});
      this.uniforms.$extend(map);
      return this;
    },

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
        var offsets = this.offsets;
        this.attributes.forEach(function(v, i) { v.specify(stride, offsets[i]) });
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

      this.uniforms.forIn(function(k, v) { v.reassign() });

      // console.log("-- end");
    },
  });

});
