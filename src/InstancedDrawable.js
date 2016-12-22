phina.namespace(function() {

  /**
   * @constructor phigl.InstancedDrawable
   * @extends {phigl.Drawable}
   * @param  {WebGLRenderingContext} gl context
   * @param {WebGLExtension?} extVao value of gl.getExtension('ANGLE_instanced_arrays')
   */
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
      }
      this.instanceStride = stride;

      return this;
    },
    
    setInstanceAttributeVbo: function(vbo) {
      this.instanceVbo = vbo;

      this.instanceVbo.bind();
      var iStride = this.instanceStride;
      var iOffsets = this.instanceOffsets;
      this.instanceAttributes.forEach(function(v, i) { v.specify(iStride, iOffsets[i]) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    setInstanceAttributeData: function(data) {
      if (!this.instanceVbo) this.instanceVbo = phigl.Vbo(this.gl, this.gl.DYNAMIC_DRAW);
      this.instanceVbo.set(data);

      this.instanceVbo.bind();
      var iStride = this.instanceStride;
      var iOffsets = this.instanceOffsets;
      this.instanceAttributes.forEach(function(v, i) { v.specify(iStride, iOffsets[i]) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    setInstanceAttributeDataArray: function(dataArray) {
      if (!this.instanceVbo) this.instanceVbo = phigl.Vbo(this.gl);
      this.instanceVbo.setAsInterleavedArray(dataArray);

      this.instanceVbo.bind();
      var iStride = this.instanceStride;
      var iOffsets = this.instanceOffsets;
      this.instanceAttributes.forEach(function(v, i) { v.specify(iStride, iOffsets[i]) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    createVao: function() {
      return this;
    },

    draw: function(instanceCount) {
      var gl = this.gl;
      var ext = this.ext;

      this.program.use();

      if (this.indices) this.indices.bind();

      if (this.vbo) this.vbo.bind();
      var stride = this.stride;
      var offsets = this.offsets;
      this.attributes.forEach(function(v, i) {
        v.specify(stride, offsets[i]);
      });

      if (this.instanceVbo) this.instanceVbo.bind();
      var iStride = this.instanceStride;
      var iOffsets = this.instanceOffsets;
      this.instanceAttributes.forEach(function(v, i) {
        v.specify(iStride, iOffsets[i]);
        ext.vertexAttribDivisorANGLE(v._location, 1);
      });

      this.uniforms.forIn(function(k, v) { v.assign() });

      this.flare("predraw");
      this.ext.drawElementsInstancedANGLE(this.drawMode, this.indices.length, gl.UNSIGNED_SHORT, 0, instanceCount);
      this.flare("postdraw");

      this.instanceAttributes.forEach(function(v, i) {
        ext.vertexAttribDivisorANGLE(v._location, 0);
      });
      phigl.Ibo.unbind(gl);
      phigl.Vbo.unbind(gl);
    },

  });

});
