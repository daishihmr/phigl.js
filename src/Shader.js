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
