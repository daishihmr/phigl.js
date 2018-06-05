phina.namespace(function() {

  phina.define("phigl.WebGLCanvasPool", {

    _pool: null,
    _actives: null,

    webglParameters: null,

    init: function() {
      this._pool = [];
      this._actives = [];

      this.webglParameters = {};
    },

    create: function() {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl", this.webglParameters);
      canvas.webglId = phigl.GL.getId(gl);
      return canvas;
    },

    get: function() {
      if (this._pool.length === 0) {
        const canvas = this.create();
        const self = this;
        cavnas.relase = function() {
          self.dispose(this);
        };
        this._pool.push(canvas);
      }

      const result = this._pool.shift();
      this._actives.push(result);
      return result;
    },

    dispose: function(canvas) {
      if (this._actives.indexOf(canvas)) {
        this._actives.erase(canvas);
        this._pool.push(canvas);
      }
    },

  });

});
