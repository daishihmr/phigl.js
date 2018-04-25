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

    /** 
     * @type {WebGLRenderingContext}
     * @memberOf phigl.Attribute.prototype
     */
    gl: null,
    /**
     * @type {string}
     * @memberOf phigl.Attribute.prototype
     */
    name: null,

    _location: null,
    _type: null,
    _ptype: null,
    _offset: 0,

    init: function(gl, program, name, type) {
      this.gl = gl;
      this.name = name;

      this._location = gl.getAttribLocation(program, name);
      if (this._location == -1) {
        throw "attribute " + name + " not found";
      }
      // this.enable();

      this._type = type;
      switch (type) {
        case gl.BOOL:
          this.size = 1;
          this._ptype = gl.BOOL;
          break;
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
     * set stride
     * @memberOf phigl.Attribute.prototype
     * @param  {number} stride
     * @return {this}
     */
    specify: function(stride) {
      // console.log("attribute", this.name, this._location);
      var gl = this.gl;
      gl.vertexAttribPointer(this._location, this.size, this._ptype, false, stride, this._offset);
      return this;
    },

    enable: function() {
      var gl = this.gl;
      gl.enableVertexAttribArray(this._location);
      return this;
    },

    disable: function() {
      var gl = this.gl;
      gl.disableVertexAttribArray(this._location);
      return this;
    },

  });

});

phina.namespace(function() {

  /**
   * GLSL Attribute variable.
   * @constructor phigl.Detector
   */
  phina.define("phigl.Detector", {
    _static: {
      
      /**
       * @memberOf phigl.Detector
       * @property {boolean}
       */
      isEnable: (function() {
        try {
          var canvas = document.createElement('canvas');
          var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          return !!(window.WebGLRenderingContext && gl && gl.getShaderPrecisionFormat);
        } catch (e) {
          return false;
        }
      })(),
    },
  });

});

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

      if (this.vao) {
        ext.deleteVertexArrayOES(this.vao);
      } else {
        this.indices.delete();
        this.vbo.delete();
      }
    },
  });

});

phina.namespace(function() {

  /**
   * @constructor phigl.Extensions
   */
  phina.define("phigl.Extensions", {

    _static: {

      getVertexArrayObject: function(gl) {
        return this._get(gl, "OES_vertex_array_object");
      },

      getInstancedArrays: function(gl) {
        return this._get(gl, "ANGLE_instanced_arrays");
      },

      _get: function(gl, name) {
        var ext = gl.getExtension(name);
        if (ext) {
          return ext;
        } else {
          throw name + " is not supported";
        }
      }
    },

  });

});
phina.namespace(function() {

  /**
   * @constructor phigl.Framebuffer
   * @param  {WebGLRenderingContext} gl context
   * @param {number} width
   * @param {number} height
   */
  phina.define("phigl.Framebuffer", {
    gl: null,
    
    /**
     * @type {phigl.Texture}
     * @memberOf phigl.Framebuffer.prototype
     */
    texture: null,

    _framebuffer: null,
    _depthRenderbuffer: null,
    _texture: null,

    init: function(gl, width, height, options) {
      options = options || {};

      this.gl = gl;
      this.width = width;
      this.height = height;

      this._framebuffer = gl.createFramebuffer();

      gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

      // depth_stencil
      this._depthStencilRenderbuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthStencilRenderbuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilRenderbuffer);

      // // stencil
      // this._stencilRenderbuffer = gl.createRenderbuffer();
      // gl.bindRenderbuffer(gl.RENDERBUFFER, this._stencilRenderbuffer);
      // gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, width, height);
      // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._stencilRenderbuffer);

      // color
      this.texture = phigl.Texture(gl);
      this._texture = this.texture._texture;
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.magFilter || gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.minFilter || gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0);

      // reset
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },

    /**
     * @memberOf phigl.Framebuffer.prototype
     * @return {this}
     */
    bind: function() {
      var gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
      gl.viewport(0, 0, this.width, this.height);
      return this;
    },

    _static: {
      /**
       * @memberOf phigl.Framebuffer
       * @param  {WebGLRenderingContext} gl context
       */
      unbind: function(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      },
    },
  });

});

phina.namespace(function() {

  phina.define("phigl.Geometry", {

    positions: null,
    normals: null,
    uvs: null,
    indices: null,

    init: function(options) {},

    setTo: function(drawable) {
      var atributeNames = [];
      var attributeDataArray = [];
      if (this.positions) {
        atributeNames.push("position");
        attributeDataArray.push({ unitSize: 3, data: this.positions });
      }
      if (this.normals) {
        atributeNames.push("normal");
        attributeDataArray.push({ unitSize: 3, data: this.normals });
      }
      if (this.uvs) {
        atributeNames.push("uv");
        attributeDataArray.push({ unitSize: 2, data: this.uvs });
      }

      drawable
        .declareAttributes(atributeNames)
        .setAttributeDataArray(attributeDataArray)
        .setIndexValues(this.indices);

      return this;
    },

  });

  phigl.Drawable.prototype.$method("setGeometry", function(geometry) {
    geometry.setTo(this);
    return this;
  });

});
phina.namespace(function() {

  phina.define("phigl.GL", {
    _static: {
      getId: function(gl) {
        if (gl.id == null) {
          gl.id = "phigl-WebGLRenderingContext-" + (new Date()).getTime().toString(16) + Math.floor(Math.random() * 1000).toString(16);
        }
        return gl.id;
      },
    },
  });

});

phina.namespace(function() {

  /**
   * @constructor phigl.Ibo
   * @param  {WebGLRenderingContext} gl context
   */
  phina.define("phigl.Ibo", {

    /**
     * @memberOf phigl.Ibo.prototype
     */
    gl: null,
    /**
     * @memberOf phigl.Ibo.prototype
     */
    length: 0,

    _buffer: null,

    init: function(gl) {
      this.gl = gl;
      this._buffer = gl.createBuffer();
    },

    /**
     * @memberOf phigl.Ibo.prototype
     */
    set: function(data) {
      var gl = this.gl;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      this.length = data.length;
      return this;
    },

    /**
     * @memberOf phigl.Ibo.prototype
     */
    bind: function() {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._buffer);
      return this;
    },

    /**
     * @memberOf phigl.Ibo.prototype
     */
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
      /**
       * @memberOf phigl.Ibo.prototype
       */
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

phina.namespace(function() {

  /**
   * @constructor phigl.ImageUtil
   */
  phina.define("phigl.ImageUtil", {

    init: function() {},

    _static: {

      calcSizePowOf2: function(origWidth, origHeight) {
        var asp = origWidth / origHeight;

        var width = Math.pow(2, Math.ceil(Math.log2(origWidth)));
        var height = Math.pow(2, Math.ceil(Math.log2(origHeight)));

        var fitW = asp > width / height;

        if (fitW) {
          var h = width / asp;
          return {
            srcX: 0,
            srcY: (height - h) * 0.5,
            srcWidth: width,
            srcHeight: h,
            width: width,
            height: height,
          };
        } else {
          var w = height * asp;
          return {
            srcX: (width - w) * 0.5,
            srcY: 0,
            srcWidth: w,
            srcHeight: height,
            width: width,
            height: height,
          };
        }
      },

      /**
       * @memberOf phigl.ImageUtil
       */
      resizePowOf2: function(options) {
        options = ({}).$safe(options, {
          dst: null,
        });

        var src = options.src;
        var dst = options.dst || phina.graphics.Canvas();
        var fitW = src.width < src.height;
        var asp = src.width / src.height;

        if (typeof(src) == "string") {
          src = phina.asset.AssetManager.get("image", src);
        }

        if (Math.sqrt(src.domElement.width) % 1 === 0 && Math.sqrt(src.domElement.height) % 1 === 0) {
          return src;
        }

        dst.clear();

        var width = Math.pow(2, Math.ceil(Math.log2(src.domElement.width)));
        var height = Math.pow(2, Math.ceil(Math.log2(src.domElement.height)));
        dst.domElement.width = width;
        dst.domElement.height = height;

        if (fitW) {
          var h = width / asp;
          dst.context.drawImage(src.domElement,
            0, 0, src.domElement.width, src.domElement.height,
            0, (height - h) * 0.5, width, h
          );
        } else {
          var w = height * asp;
          dst.context.drawImage(src.domElement,
            0, 0, src.domElement.width, src.domElement.height,
            (width - w) * 0.5, 0, w, height
          );
        }

        return dst;
      },

    },

  });
});

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

    init: function(gl, extInstancedArrays) {
      this.superInit(gl);
      this.ext = extInstancedArrays;
      this.instanceAttributes = [];
    },

    declareInstanceAttributes: function(names) {
      names = Array.prototype.concat.apply([], arguments);

      var gl = this.gl;
      var ext = this.ext;

      var stride = 0;
      for (var i = 0; i < names.length; i++) {
        var attr = names[i];
        if (typeof attr === "string") attr = this.program.getAttribute(attr);
        this.instanceAttributes.push(attr);
        attr._offset = stride;
        stride += attr.size * 4;
      }
      this.instanceStride = stride;

      return this;
    },

    setInstanceAttributes: function(names) {
      console.warn("deprecated");
      return this.declareInstanceAttributes(names);
    },
    
    setInstanceAttributeVbo: function(vbo) {
      this.instanceVbo = vbo;

      this.instanceVbo.bind();
      var iStride = this.instanceStride;
      this.instanceAttributes.forEach(function(v, i) { v.specify(iStride) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    setInstanceAttributeData: function(data) {
      if (!this.instanceVbo) this.instanceVbo = phigl.Vbo(this.gl, this.gl.DYNAMIC_DRAW);
      this.instanceVbo.set(data);

      this.instanceVbo.bind();
      var iStride = this.instanceStride;
      this.instanceAttributes.forEach(function(v, i) { v.specify(iStride) });
      phigl.Vbo.unbind(this.gl);

      return this;
    },

    setInstanceAttributeDataArray: function(dataArray) {
      if (!this.instanceVbo) this.instanceVbo = phigl.Vbo(this.gl);
      this.instanceVbo.setAsInterleavedArray(dataArray);

      this.instanceVbo.bind();
      var iStride = this.instanceStride;
      this.instanceAttributes.forEach(function(v, i) { v.specify(iStride) });
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
      this.attributes.forEach(function(v, i) {
        v.enable();
        v.specify(stride);
      });

      if (this.instanceVbo) this.instanceVbo.bind();
      var iStride = this.instanceStride;
      this.instanceAttributes.forEach(function(v, i) {
        v.enable();
        v.specify(iStride);
        ext.vertexAttribDivisorANGLE(v._location, 1);
      });

      this.uniforms.forIn(function(k, v) { v.assign() });

      this.flare("predraw");
      this.ext.drawElementsInstancedANGLE(this.drawMode, this.indices.length, gl.UNSIGNED_SHORT, 0, instanceCount);
      this.flare("postdraw");

      this.attributes.forEach(function(v, i) {
        v.disable();
      });
      this.instanceAttributes.forEach(function(v, i) {
        v.disable();
        ext.vertexAttribDivisorANGLE(v._location, 0);
      });
      phigl.Ibo.unbind(gl);
      phigl.Vbo.unbind(gl);
    },

  });

});

phina.namespace(function() {

  /**
   * @constructor phigl.PostProcessing
   */
  phina.define("phigl.PostProcessing", {

    /**
     * @memberOf phigl.PostProcessing.prototype
     */
    gl: null,
    /**
     * @memberOf phigl.PostProcessing.prototype
     */
    drawer: null,

    /**
     * @memberOf phigl.PostProcessing.prototype
     */
    width: 0,
    /**
     * @memberOf phigl.PostProcessing.prototype
     */
    height: 0,

    init: function(gl, shader, uniforms, width, height) {
      this.gl = gl;

      if (typeof(shader) == "string") {
        shader = phigl.PostProcessing.createProgram(gl, shader);
      }
      width = width || 256;
      height = height || 256;
      uniforms = uniforms || [];

      var sqWidth = Math.pow(2, Math.ceil(Math.log2(width)));
      var sqHeight = Math.pow(2, Math.ceil(Math.log2(height)));

      this.drawer = phigl.Drawable(gl)
        .setDrawMode(gl.TRIANGLE_STRIP)
        .setProgram(shader)
        .setIndexValues([0, 1, 2, 3])
        .setAttributes("position", "uv")
        .setAttributeData([
          //
          -1, +1, 0, height / sqHeight,
          //
          +1, +1, width / sqWidth, height / sqHeight,
          //
          -1, -1, 0, 0,
          // 
          +1, -1, width / sqWidth, 0,
        ])
        .setUniforms(["texture", "canvasSize"].concat(uniforms));

      this.width = width;
      this.height = height;
      this.sqWidth = sqWidth;
      this.sqHeight = sqHeight;
    },

    /**
     * @memberOf phigl.PostProcessing.prototype
     */
    render: function(texture, uniformValues) {
      var gl = this.gl;

      this.drawer.uniforms.texture.setValue(0).setTexture(texture);
      this.drawer.uniforms.canvasSize.value = [this.sqWidth, this.sqHeight];
      if (uniformValues) this.setUniforms(uniformValues);
      this.drawer.draw();

      return this;
    },

    /**
     * @memberOf phigl.PostProcessing.prototype
     */
    setUniforms: function(uniformValues) {
      var uniforms = this.drawer.uniforms;
      uniformValues.forIn(function(k, v) {
        uniforms[k].value = v;
      });
    },

    /**
     * @memberOf phigl.PostProcessing.prototype
     */
    calcCoord: function(x, y) {
      return [x / this.sqWidth, (this.height - y) / this.sqHeight];
    },

    _static: {
      /**
       * @memberOf phigl.PostProcessing
       */
      vertexShaderSource: [
        "attribute vec2 position;",
        "attribute vec2 uv;",

        "varying vec2 vUv;",

        "void main(void) {",
        "  vUv = uv;",
        "  gl_Position = vec4(position, 0.0, 1.0);",
        "}",
      ].join("\n"),

      /**
       * @memberOf phigl.PostProcessing
       */
      createProgram: function(gl, fragmentShader) {
        var vertexShader = phigl.VertexShader(gl);
        vertexShader.data = this.vertexShaderSource;

        return phigl.Program(gl)
          .attach(vertexShader)
          .attach(fragmentShader)
          .link();
      },
    },

  });

});

phina.namespace(function() {
  var id = 0;

  /**
   * @constructor phigl.Program
   * @param  {WebGLRenderingContext} gl context
   */
  phina.define("phigl.Program", {

    _static: {
      /**
       * @memberOf phigl.Program
       */
      currentUsing: null,
    },

    /**
     * @memberOf phigl.Program.prototype
     */
    gl: null,
    /**
     * @memberOf phigl.Program.prototype
     */
    linked: false,

    _program: null,

    _vbo: null,

    _attributes: null,
    _uniforms: null,

    _shaders: null,

    init: function(gl) {
      this.gl = gl;

      this._program = gl.createProgram();
      this._program._id = id++;
      this.linked = false;

      this._attributes = {};
      this._uniforms = {};

      this._shaders = [];
    },

    /**
     * @param {string|phigl.Shader} shader
     * @memberOf phigl.Program.prototype
     * @return {this}
     */
    attach: function(shader) {
      var gl = this.gl;

      if (typeof shader === "string") {
        shader = phina.asset.AssetManager.get("vertexShader", shader) || phina.asset.AssetManager.get("fragmentShader", shader);
      }

      if (!shader.compiled) {
        shader.compile(gl);
      }

      gl.attachShader(this._program, shader._shader);

      this._shaders.push(shader);

      return this;
    },

    /**
     * @memberOf phigl.Program.prototype
     * @return {this}
     */
    link: function() {
      var gl = this.gl;

      gl.linkProgram(this._program);
      gl.validateProgram(this._program);

      if (gl.getProgramParameter(this._program, gl.LINK_STATUS)) {

        var attrCount = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);
        for (var i = 0; i < attrCount; i++) {
          var attr = gl.getActiveAttrib(this._program, i);
          this.getAttribute(attr.name, attr.type);
        }

        var uniCount = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
        for (var i = 0; i < uniCount; i++) {
          var uni = gl.getActiveUniform(this._program, i);
          this.getUniform(uni.name, uni.type);
        }

        this.linked = true;
        return this;
      } else {
        this.linked = false;
        throw gl.getProgramInfoLog(this._program);
      }
    },

    /**
     * @param {string} name
     * @param {number} type
     * @memberOf phigl.Program.prototype
     * @return {phigl.Attribute}
     */
    getAttribute: function(name, type) {
      if (!this._attributes[name]) {
        this._attributes[name] = phigl.Attribute(this.gl, this._program, name, type);
      }
      return this._attributes[name];
    },

    /**
     * @param {string} name
     * @param {number} type
     * @memberOf phigl.Program.prototype
     * @return {phigl.Uniform}
     */
    getUniform: function(name, type) {
      if (!this._uniforms[name]) {
        this._uniforms[name] = phigl.Uniform(this.gl, this._program, name, type);
      }
      return this._uniforms[name];
    },

    /**
     * @memberOf phigl.Program.prototype
     * @return {this}
     */
    use: function() {
      if (phigl.Program.currentUsing === this) return this;
      this.gl.useProgram(this._program);
      phigl.Program.currentUsing = this;
      return this;
    },

    /**
     * @memberOf phigl.Program.prototype
     * @return {this}
     */
    delete: function() {
      var gl = this.gl;
      var program = this._program;
      this._shaders.forEach(function(shader) {
        gl.detachShader(program, shader._shader);
      });
      this._shaders.forEach(function(shader) {
        gl.deleteShader(shader._shader);
      });
      gl.deleteProgram(program);
      return this;
    },
  });

});

phina.namespace(function() {

  /**
   * @constructor phigl.Shader
   * @extends {phina.asset.File}
   */
  phina.define("phigl.Shader", {
    superClass: "phina.asset.File",

    /**
     * @memberOf phigl.Shader.prototype
     */
    type: null,
    /**
     * @memberOf phigl.Shader.prototype
     */
    gl: null,
    /**
     * @memberOf phigl.Shader.prototype
     */
    compiled: false,

    _shader: null,

    init: function() {
      this.superInit();
      this.compiled = false;
    },

    setSource: function(text) {
      this.data = text;
      return this;
    },

    /**
     * @memberOf phigl.Shader.prototype
     */
    compile: function(gl) {
      this.gl = gl;

      this.type = this._type(gl);

      this._shader = gl.createShader(this.type);
      gl.shaderSource(this._shader, this.data);
      gl.compileShader(this._shader);

      if (gl.getShaderParameter(this._shader, gl.COMPILE_STATUS)) {
        this.compiled = true;
        return this;
      } else {
        this.compiled = false;
        throw gl.getShaderInfoLog(this._shader);
      }
    },

    _type: function(gl) {
      return 0;
    },
  });

  /**
   * @constructor phigl.VertexShader
   * @extends {phigl.Shader}
   */
  phina.define("phigl.VertexShader", {
    superClass: "phigl.Shader",

    init: function() {
      this.superInit();
    },

    _type: function(gl) {
      return gl.VERTEX_SHADER;
    },
  });
  phina.asset.AssetLoader.assetLoadFunctions["vertexShader"] = function(key, path) {
    var shader = phigl.VertexShader();
    return shader.load({
      path: path,
    });
  };

  /**
   * @constructor phigl.FragmentShader
   * @extends {phigl.Shader}
   */
  phina.define("phigl.FragmentShader", {
    superClass: "phigl.Shader",

    init: function() {
      this.superInit();
    },

    _type: function(gl) {
      return gl.FRAGMENT_SHADER;
    },
  });
  phina.asset.AssetLoader.assetLoadFunctions["fragmentShader"] = function(key, path) {
    var shader = phigl.FragmentShader();
    return shader.load({
      path: path,
    });
  };

});

phina.namespace(function() {

  phina.define("phigl.PlaneXY", {
    superClass: "phigl.Geometry",

    init: function(options) {
      this.superInit(options);
      options = ({}).$safe(options, phigl.PlaneXY.defaults);

      this.width = options.width;
      this.height = options.height;
      this.normalsEnabled = options.normalsEnabled;

      this.positions = [
        // 左上
        options.width * -0.5, options.height * +0.5, 0,
        // 左下
        options.width * -0.5, options.height * -0.5, 0,
        // 右上
        options.width * +0.5, options.height * +0.5, 0,
        // 右下
        options.width * +0.5, options.height * -0.5, 0,
      ];
      if (this.normalsEnabled) {
        this.normals = [
          // 左上
          0, 0, 1,
          // 左下
          0, 0, 1,
          // 右上
          0, 0, 1,
          // 右下
          0, 0, 1,
        ];
      }
      this.uvs = [
        // 左上
        0, 1,
        // 左下
        0, 0,
        // 右上
        1, 1,
        // 右下
        1, 0,
      ];
      this.indices = [0, 1, 2, 2, 1, 3];
    },

    _static: {
      defaults: {
        width: 1,
        height: 1,
        normalsEnabled: true,
      },
    },

  });

});
phina.namespace(function() {

  /**
   * @constructor phigl.Texture
   * @param  {WebGLRenderingContext} gl context
   * @param  {(string|phina.asset.Texture|phina.graphics.Canvas)=} image context
   */
  phina.define("phigl.Texture", {

    /**
     * @memberOf phigl.Texture.prototype
     */
    gl: null,

    _texture: null,

    init: function(gl, image) {
      this.gl = gl;
      this._texture = gl.createTexture();
      if (image) {
        this.setImage(image);
      }
    },

    /**
     * @memberOf phigl.Texture.prototype
     * @param  {string|phina.asset.Texture|phina.graphics.Canvas} image context
     */
    setImage: function(image, funcSetting) {
      var gl = this.gl;

      if (typeof image === "string") {
        image = phina.asset.AssetManager.get("image", image);
      }
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image.domElement);

      funcSetting = funcSetting || function(gl) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.generateMipmap(gl.TEXTURE_2D);
      };

      funcSetting(gl);

      gl.bindTexture(gl.TEXTURE_2D, null);

      return this;
    },

    /**
     * @memberOf phigl.Texture.prototype
     * @param {number} unitIndex
     */
    bind: function(unitIndex) {
      var gl = this.gl;
      gl.activeTexture(gl["TEXTURE" + (unitIndex || 0)]);
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      return this;
    },

    /**
     * @memberOf phigl.Texture.prototype
     */
    delete: function() {
      this.gl.deleteTexture(this._texture);
    },
    
    _static: {
      /**
       * @memberOf phigl.Texture
       * @param  {WebGLRenderingContext} gl context
       */
      unbind: function(gl) {
        gl.bindTexture(gl.TEXTURE_2D, null);
        return this;
      },
    },
  });

});

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
        case gl.BOOL:
          this._uniformMethod = "uniform1i";
          break;
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
        case gl.BOOL:
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

phina.namespace(function() {
  var i = 0;

  /**
   * @constructor phigl.Vbo
   * @param  {WebGLRenderingContext} gl context
   */
  phina.define("phigl.Vbo", {

    /**
     * @memberOf phigl.Vbo.prototype
     */
    gl: null,
    /**
     * @memberOf phigl.Vbo.prototype
     */
    usage: null,
    _vbo: null,

    /**
     * @memberOf phigl.Vbo.prototype
     */
    array: null,

    init: function(gl, usage) {
      this.gl = gl;
      this.usage = usage || gl.STATIC_DRAW;
      this._vbo = gl.createBuffer();
      this._vbo._id = i++;
    },

    /**
     * @memberOf phigl.Vbo.prototype
     */
    set: function(data) {
      var gl = this.gl;
      if (this.array) {
        this.array.set(data);
      } else {
        this.array = new Float32Array(data);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
      gl.bufferData(gl.ARRAY_BUFFER, this.array, this.usage);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return this;
    },

    /**
     * @param {Array.<object>} dataArray [{ unitSize: n, data: [number] }, ...]
     * @memberOf phigl.Vbo.prototype
     */
    setAsInterleavedArray: function(dataArray) {
      var dataCount = dataArray.length;
      var vertexCount = dataArray[0].data.length / dataArray[0].unitSize;
      var interleavedArray = [];
      for (var i = 0; i < vertexCount; i++) {
        for (var j = 0; j < dataCount; j++) {
          var d = dataArray[j];
          for (var k = 0; k < d.unitSize; k++) {
            interleavedArray.push(d.data[i * d.unitSize + k]);
          }
        }
      }
      return this.set(interleavedArray);
    },

    /**
     * @memberOf phigl.Vbo.prototype
     */
    bind: function() {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
      // console.log("bindBuffer", this._vbo, this.array.length);
      return this;
    },

    /**
     * @memberOf phigl.Vbo.prototype
     */
    delete: function() {
      this.gl.deleteBuffer(this._vbo);
    },

    _static: {
      /**
       * @memberOf phigl.Vbo
       */
      unbind: function(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        // console.log("unbind")
      },
    },

  });
});
//# sourceMappingURL=phigl.js.map
