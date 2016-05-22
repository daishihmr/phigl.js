phina.namespace(function() {
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
