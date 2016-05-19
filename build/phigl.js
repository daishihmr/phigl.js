phina.namespace(function() {
  var GL = WebGLRenderingContext;

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
        case GL.FLOAT:
          this.size = 1;
          this._ptype = GL.FLOAT;
          break;
        case GL.FLOAT_VEC2:
          this.size = 2;
          this._ptype = GL.FLOAT;
          break;
        case GL.FLOAT_VEC3:
          this.size = 3;
          this._ptype = GL.FLOAT;
          break;
        case GL.FLOAT_VEC4:
          this.size = 4;
          this._ptype = GL.FLOAT;
          break;
      }
    },

    specify: function(stride, offset) {
      this.gl.vertexAttribPointer(this._location, this.size, this._ptype, false, stride, offset);
      return this;
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

phina.namespace(function() {
  var GL = WebGLRenderingContext;

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
    drawMode: GL.TRIANGLES,
    vao: null,

    init: function(gl) {
      this.superInit();
      this.gl = gl;
      this.attributes = [];
      this.offsets = [];
      this.uniforms = {};
    },

    setDrawMode: function(mode) {
      this.drawMode = mode;
      return this;
    },

    setProgram: function(program) {
      this.program = program;
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

    setAttributeData: function(data) {
      if (!this.vbo) this.vbo = phigl.Vbo(this.gl);
      this.vbo.set(data);
      return this;
    },

    setAttributeDataArray: function(dataArray) {
      if (!this.vbo) this.vbo = phigl.Vbo(this.gl);
      this.vbo.setAsInterleavedArray(dataArray);
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
      this.gl.drawElements(this.drawMode, this.indices.length, GL.UNSIGNED_SHORT, 0);
      this.flare("postdraw");

      if (this.vao) {
        ext.bindVertexArrayOES(null);
      } else {
        phigl.Ibo.unbind(gl);
        phigl.Vbo.unbind(gl);
      }
    },
  });

});

phina.namespace(function() {
  
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
  var GL = WebGLRenderingContext;

  phina.define("phigl.Framebuffer", {
    gl: null,
    texture: null,

    _framebuffer: null,
    _depthRenderbuffer: null,
    _texture: null,

    init: function(gl, width, height) {
      this.gl = gl;
      this.width = width;
      this.height = height;
      
      this.texture = phigl.Texture(gl);

      this._framebuffer = gl.createFramebuffer();
      this._depthRenderbuffer = gl.createRenderbuffer();
      this._texture = this.texture._texture;

      gl.bindFramebuffer(GL.FRAMEBUFFER, this._framebuffer);

      gl.bindRenderbuffer(GL.RENDERBUFFER, this._depthRenderbuffer);
      gl.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, width, height);

      gl.bindTexture(GL.TEXTURE_2D, this._texture);
      gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);

      gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
      gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
      gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

      gl.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this._texture, 0);

      gl.bindTexture(GL.TEXTURE_2D, null);
      gl.bindRenderbuffer(GL.RENDERBUFFER, null);
      gl.bindFramebuffer(GL.FRAMEBUFFER, null);
    },

    bind: function() {
      var gl = this.gl;
      gl.bindFramebuffer(GL.FRAMEBUFFER, this._framebuffer);
      gl.viewport(0, 0, this.width, this.height);
      return this;
    },

    unbind: function() {
      this.gl.bindFramebuffer(GL.FRAMEBUFFER, null);
      return this;
    },
  });

});

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

phina.namespace(function() {
  var GL = WebGLRenderingContext;

  phina.define("phigl.InstancedDrawable", {
    superClass: "phigl.Drawable",

    instanceAttributes: null,
    ext: null,

    instanceVbo: null,
    instanceStride: 0,
    instanceOffsets: null,

    init: function(gl) {
      this.superInit(gl);
      this.ext = phigl.Extensions.getInstancedArrays(gl);
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
      if (!this.instanceVbo) this.instanceVbo = phigl.Vbo(this.gl, GL.DYNAMIC_DRAW);
      this.instanceVbo.set(data);
      return this;
    },

    setInstanceAttributeDataArray: function(dataArray) {
      if (!this.instanceVbo) this.instanceVbo = phigl.Vbo(this.gl);
      this.instanceVbo.setAsInterleavedArray(dataArray);
      return this;
    },

    createVao: function() {
      // TODO 封印中
      return this;

      var gl = this.gl;
      var stride = this.stride;
      var offsets = this.offsets;
      var iStride = this.instanceStride;
      var iOffsets = this.instanceOffsets;

      if (!this.extVao) this.extVao = phigl.Extensions.getVertexArrayObject(gl);
      if (!this.vao) this.vao = this.extVao.createVertexArrayOES();

      this.extVao.bindVertexArrayOES(this.vao);

      if (this.indices) this.indices.bind();
      if (this.vbo) this.vbo.bind();
      this.attributes.forEach(function(v, i) {
        gl.enableVertexAttribArray(v._location);
        v.specify(stride, offsets[i]);
      });
      if (this.instanceVbo) this.instanceVbo.bind();
      this.instanceAttributes.forEach(function(v, i) {
        gl.enableVertexAttribArray(v._location);
        v.specify(iStride, iOffsets[i]);
      });

      this.extVao.bindVertexArrayOES(null);

      phigl.Ibo.unbind(gl);
      phigl.Vbo.unbind(gl);

      return this;
    },

    draw: function(instanceCount) {
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
        var iStride = this.instanceStride;
        var iOffsets = this.instanceOffsets;
        if (this.instanceVbo) this.instanceVbo.bind();
        this.instanceAttributes.forEach(function(v, i) { v.specify(iStride, iOffsets[i]) });
      }

      this.uniforms.forIn(function(k, v) { v.assign() });

      this.flare("predraw");
      this.ext.drawElementsInstancedANGLE(this.drawMode, this.indices.length, GL.UNSIGNED_SHORT, 0, instanceCount);
      this.flare("postdraw");

      if (this.vao) {
        ext.bindVertexArrayOES(null);
      } else {
        phigl.Ibo.unbind(gl);
        phigl.Vbo.unbind(gl);
      }
    },

  });

});

phina.namespace(function() {
  var GL = WebGLRenderingContext;
  var id = 0;

  phina.define("phigl.Program", {

    gl: null,
    linked: false,

    _program: null,

    _vbo: null,

    _attributes: null,
    _uniforms: null,

    init: function(gl) {
      this.gl = gl;

      this._program = gl.createProgram();
      this._program._id = id++;
      this.linked = false;

      this._attributes = {};
      this._uniforms = {};
    },

    attach: function(shader) {
      var gl = this.gl;

      if (typeof shader === "string") {
        shader = phina.asset.AssetManager.get("vertexShader", shader) || phina.asset.AssetManager.get("fragmentShader", shader);
      }

      if (!shader.compiled) {
        shader.compile(gl);
      }

      gl.attachShader(this._program, shader._shader);

      return this;
    },

    link: function() {
      var gl = this.gl;

      gl.linkProgram(this._program);

      if (gl.getProgramParameter(this._program, GL.LINK_STATUS)) {
        var attrCount = gl.getProgramParameter(this._program, GL.ACTIVE_ATTRIBUTES);
        for (var i = 0; i < attrCount; i++) {
          var attr = gl.getActiveAttrib(this._program, i);
          this.getAttribute(attr.name, attr.type);
        }

        var uniCount = gl.getProgramParameter(this._program, GL.ACTIVE_UNIFORMS);
        for (var i = 0; i < uniCount; i++) {
          var uni = gl.getActiveUniform(this._program, i);
          this.getUniform(uni.name, uni.type);
        }

        this.linked = true;
        return this;
      } else {
        this.linked = false;
        throw (gl.getProgramInfoLog(this._program));
      }
    },
    
    getAttribute: function(name) {
      if (!this._attributes[name]) {
        this._attributes[name] = phigl.Attribute(this.gl, this._program, name);
      }
      return this._attributes[name];
    },

    getUniform: function(name, type) {
      if (!this._uniforms[name]) {
        this._uniforms[name] = phigl.Uniform(this.gl, this._program, name, type);
      }
      return this._uniforms[name];
    },

    use: function() {
      this.gl.useProgram(this._program);
      return this;
    },
  });

});

phina.namespace(function() {
  var GL = WebGLRenderingContext;

  phina.define("phigl.Shader", {
    superClass: "phina.asset.File",

    type: null,
    gl: null,
    compiled: false,

    _shader: null,

    init: function() {
      this.superInit();
      this.compiled = false;
    },

    compile: function(gl) {
      this.gl = gl;
      
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
  });

  phina.define("phigl.VertexShader", {
    superClass: "phigl.Shader",

    init: function() {
      this.superInit();
      this.type = GL.VERTEX_SHADER;
    },
  });
  phina.asset.AssetLoader.assetLoadFunctions["vertexShader"] = function(key, path) {
    var shader = phigl.VertexShader();
    return shader.load({
      path: path,
    });
  };

  phina.define("phigl.FragmentShader", {
    superClass: "phigl.Shader",

    init: function() {
      this.superInit();
      this.type = GL.FRAGMENT_SHADER;
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
  var GL = WebGLRenderingContext;

  phina.define("phigl.Texture", {

    gl: null,

    _texture: null,

    init: function(gl, image) {
      this.gl = gl;
      this._texture = gl.createTexture();
      if (image) {
        this.setImage(image);
      }
    },

    setImage: function(image, unitIndex) {
      var gl = this.gl;

      if (typeof image === "string") {
        image = phina.asset.AssetManager.get("image", image);
      }
      gl.bindTexture(GL.TEXTURE_2D, this._texture);
      gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image.domElement);
      gl.generateMipmap(GL.TEXTURE_2D);
      gl.bindTexture(GL.TEXTURE_2D, null);

      return this;
    },

    bind: function(unitIndex) {
      var gl = this.gl;
      gl.activeTexture(GL.TEXTURE0 + (unitIndex || 0));
      gl.bindTexture(GL.TEXTURE_2D, this._texture);
      return this;
    },

    unbind: function() {
      var gl = this.gl;
      gl.bindTexture(GL.TEXTURE_2D, null);
      return this;
    },
  });

});

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

phina.namespace(function() {
  var GL = WebGLRenderingContext;

  phina.define("phigl.Vbo", {

    gl: null,
    usage: null,
    _vbo: null,

    init: function(gl, usage) {
      this.gl = gl;
      this.usage = usage || GL.STATIC_DRAW;
      this._vbo = gl.createBuffer();
    },

    set: function(data) {
      var gl = this.gl;
      gl.bindBuffer(GL.ARRAY_BUFFER, this._vbo);
      gl.bufferData(GL.ARRAY_BUFFER, new Float32Array(data), this.usage);
      gl.bindBuffer(GL.ARRAY_BUFFER, null);
      return this;
    },

    /**
     * [{ unitSize: 3, data: [...] }, { unitSize: 2, data: [...] }]
     */
    setAsInterleavedArray: function(dataArray) {
      var count = dataArray[0].data.length / dataArray[0].unitSize;
      var interleavedArray = [];
      for (var i = 0; i < count; i++) {
        dataArray.forEach(function(d) {
          for (var j = 0; j < d.unitSize; j++) {
            interleavedArray.push(d.data[i * d.unitSize + j]);
          }
        });
      }
      return this.set(interleavedArray);
    },

    bind: function() {
      this.gl.bindBuffer(GL.ARRAY_BUFFER, this._vbo);
      return this;
    },

    _static: {
      unbind: function(gl) {
        gl.bindBuffer(GL.ARRAY_BUFFER, null);
      },
    },

  });
});

//# sourceMappingURL=phigl.js.map
