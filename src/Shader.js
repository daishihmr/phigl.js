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
    /**
     * @memberOf phigl.Shader.prototype
     */
    assetType: null,

    _shader: null,

    init: function() {
      this.superInit();
      this.compiled = false;
      this.assetType = null;
    },

    setSource: function(text) {
      this.data = text;
      return this;
    },

    /**
     * @memberOf phigl.Shader.prototype
     */
    compile: function(gl) {
      this._resolveInclude();

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

    _resolveInclude: function() {
      const lines = this.data.split(/(\n|\r\n)/);
      const includes = lines.map((line, index) => {
        if (line.startsWith("// <include>")) {
          const name = line.replace("// <include>", "").trim();
          const code = phina.asset.AssetManager.get(this.assetType, name);
          if (code == null) {
            throw `そんなシェーダーないです (${name})`;
          } else {
            return code.data;
          }
        } else {
          return line;
        }
      });
      this.data = includes.join("\n");
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
      this.assetType = "vertexShader";
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
      this.assetType = "fragmentShader";
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
