phina.namespace(function() {

  phina.define("phigl.InstancedDrawable", {
    superClass: "phigl.Drawable",

    instanceAttributes: null,
    ext: null,

    instanceVbo: null,
    instanceStride: 0,
    instanceOffsets: null,

    init: function(gl, extInstancedArrays) {
      this.superInit(gl);
      this.ext = extInstancedArrays;
      this.instanceAttributes = [];
      this.instanceOffsets = [];
    },

    setInstanceAttributes: function(names) {
      names = Array.prototype.concat.apply([], arguments);

      var gl = this.gl;
      var ext = this.ext;

      var stride = 0;
      for (var i = 0; i < names.length; i++) {
        var attr = names[i];
        if (typeof attr === "string") attr = this.program.getAttribute(attr);
        this.instanceAttributes.push(attr);
        this.instanceOffsets.push(stride);
        stride += attr.size * 4;

        ext.vertexAttribDivisorANGLE(attr._location, 1);
      }
      this.instanceStride = stride;
      return this;
    },

    setInstanceAttributeData: function(data) {
      // this.program.use();

      if (!this.instanceVbo) this.instanceVbo = phigl.Vbo(this.gl, this.gl.DYNAMIC_DRAW);
      this.instanceVbo.set(data);
      return this;
    },

    setInstanceAttributeDataArray: function(dataArray) {
      // this.program.use();
      if (!this.instanceVbo) this.instanceVbo = phigl.Vbo(this.gl);
      this.instanceVbo.setAsInterleavedArray(dataArray);
      return this;
    },

    createVao: function() {
      // TODO 封印中
      return this;

      // var gl = this.gl;
      // var stride = this.stride;
      // var offsets = this.offsets;
      // var iStride = this.instanceStride;
      // var iOffsets = this.instanceOffsets;

      // if (!this.extVao) this.extVao = phigl.Extensions.getVertexArrayObject(gl);
      // if (!this.vao) this.vao = this.extVao.createVertexArrayOES();

      // this.extVao.bindVertexArrayOES(this.vao);

      // if (this.indices) this.indices.bind();
      // if (this.vbo) this.vbo.bind();
      // this.attributes.forEach(function(v, i) {
      //   gl.enableVertexAttribArray(v._location);
      //   v.specify(stride, offsets[i]);
      // });
      // if (this.instanceVbo) this.instanceVbo.bind();
      // this.instanceAttributes.forEach(function(v, i) {
      //   gl.enableVertexAttribArray(v._location);
      //   v.specify(iStride, iOffsets[i]);
      // });

      // this.extVao.bindVertexArrayOES(null);

      // phigl.Ibo.unbind(gl);
      // phigl.Vbo.unbind(gl);

      // return this;
    },

    draw: function(instanceCount) {
      var gl = this.gl;
      var ext = this.ext;

      this.program.use();

      // if (this.vao) {
      //   ext.bindVertexArrayOES(this.vao);
      // } else {
      if (this.indices) this.indices.bind();
      if (this.vbo) this.vbo.bind();
      var stride = this.stride;
      var offsets = this.offsets;
      this.attributes.forEach(function(v, i) { v.specify(stride, offsets[i]) });
      var iStride = this.instanceStride;
      var iOffsets = this.instanceOffsets;
      if (this.instanceVbo) this.instanceVbo.bind();
      this.instanceAttributes.forEach(function(v, i) {
        v.specify(iStride, iOffsets[i]);
        ext.vertexAttribDivisorANGLE(v._location, 1);
      });
      // }

      this.uniforms.forIn(function(k, v) { v.assign() });

      this.flare("predraw");
      this.ext.drawElementsInstancedANGLE(this.drawMode, this.indices.length, gl.UNSIGNED_SHORT, 0, instanceCount);
      this.flare("postdraw");

      // if (this.vao) {
      //   ext.bindVertexArrayOES(null);
      // } else {
      phigl.Ibo.unbind(gl);
      phigl.Vbo.unbind(gl);
      // }
    },

  });

});
