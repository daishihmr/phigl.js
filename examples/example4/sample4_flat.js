phina.main(function() {
  phina.asset.AssetLoader()
    .on("load", function() {
      start();
    })
    .load({
      image: {
        "sample.png": "./sample.png",
      },
      text: {
        "sample1.vs": "./sample1.vs",
        "sample2.vs": "./sample2.vs",
        "sample1.fs": "./sample1.fs",
        "sample2.fs": "./sample2.fs",
      },
    });
});

var start = function() {
  var canvas = document.getElementById("app");
  canvas.width = 512;
  canvas.height = 512;

  var vMatrix = mat4.lookAt(mat4.create(), [0, 0, 500], [0, 0, 0], [0, 1, 0]);
  var pMatrix = mat4.ortho(mat4.create(), -512, 512, -512, 512, 0.1, 1000);

  var gl = canvas.getContext("webgl");

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // 1番用意
  var program1;
  var uniform1 = {};
  var attribute1 = {};
  var ibo1;
  var vbo1;
  var mMatrix1;
  (function() {
    program1 = gl.createProgram();
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, phina.asset.AssetManager.get("text", "sample1.vs").data);
    gl.compileShader(vs);
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, phina.asset.AssetManager.get("text", "sample1.fs").data);
    gl.compileShader(fs);
    gl.attachShader(program1, vs);
    gl.attachShader(program1, fs);
    gl.linkProgram(program1);
    gl.useProgram(program1);

    uniform1["mMatrix"] = gl.getUniformLocation(program1, "mMatrix");
    uniform1["vMatrix"] = gl.getUniformLocation(program1, "vMatrix");
    uniform1["pMatrix"] = gl.getUniformLocation(program1, "pMatrix");

    attribute1["noitisop"] = gl.getAttribLocation(program1, "noitisop");
    gl.enableVertexAttribArray(attribute1["noitisop"]);

    ibo1 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo1);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array([0, 1, 2]), gl.STATIC_DRAW);

    vbo1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      //
      -0.5, +0.5,
      //
      +0.5, +0.5,
      //
      -0.5, -0.5,
    ]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    mMatrix1 = mat4.create();
    mat4.translate(mMatrix1, mMatrix1, [0, -200, 0]);
    mat4.scale(mMatrix1, mMatrix1, [300, 300, 300]);
  })();
  // 1番用意ここまで

  // 2番用意
  var program2;
  var uniform2 = {};
  var attribute2 = {};
  var ibo2;
  var vbo2;
  var texture2;
  var mMatrix2;
  (function() {
    program2 = gl.createProgram();
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, phina.asset.AssetManager.get("text", "sample2.vs").data);
    gl.compileShader(vs);
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, phina.asset.AssetManager.get("text", "sample2.fs").data);
    gl.compileShader(fs);
    gl.attachShader(program2, vs);
    gl.attachShader(program2, fs);
    gl.linkProgram(program2);
    gl.useProgram(program2);

    uniform2["mMatrix"] = gl.getUniformLocation(program2, "mMatrix");
    uniform2["vMatrix"] = gl.getUniformLocation(program2, "vMatrix");
    uniform2["pMatrix"] = gl.getUniformLocation(program2, "pMatrix");
    uniform2["texture"] = gl.getUniformLocation(program2, "texture");

    attribute2["position"] = gl.getAttribLocation(program2, "position");
    attribute2["uv"] = gl.getAttribLocation(program2, "uv");
    gl.enableVertexAttribArray(attribute2["position"]);
    gl.enableVertexAttribArray(attribute2["uv"]);

    ibo2 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo2);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array([0, 1, 2]), gl.STATIC_DRAW);

    vbo2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      //
      -0.5, +0.5, 0, 0, 0,
      //
      +0.5, +0.5, 0, 1, 0,
      //
      -0.5, -0.5, 0, 0, 1,
    ]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    texture2 = gl.createTexture();
    var image = phina.asset.AssetManager.get("image", "sample.png");
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image.domElement);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    mMatrix2 = mat4.create();
    mat4.translate(mMatrix2, mMatrix2, [0, 200, 0]);
    mat4.scale(mMatrix2, mMatrix2, [300, 300, 300]);
  })();
  // 2番用意ここまで

  // 1番描画
  var draw1 = function() {
    gl.useProgram(program1);

    gl.uniformMatrix4fv(uniform1["mMatrix"], false, mMatrix1);
    gl.uniformMatrix4fv(uniform1["vMatrix"], false, vMatrix);
    gl.uniformMatrix4fv(uniform1["pMatrix"], false, pMatrix);

    // gl.disableVertexAttribArray(attribute2["uv"]); // 追加
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo1);
    gl.vertexAttribPointer(attribute1["noitisop"], 2, gl.FLOAT, false, 8, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo1);

    gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  };
  // 1番描画ここまで

  // 2番描画
  var draw2 = function() {
    gl.useProgram(program2);

    gl.uniformMatrix4fv(uniform2["mMatrix"], false, mMatrix2);
    gl.uniformMatrix4fv(uniform2["vMatrix"], false, vMatrix);
    gl.uniformMatrix4fv(uniform2["pMatrix"], false, pMatrix);
    gl.uniform1i(uniform2["texture"], 0);

    // gl.enableVertexAttribArray(attribute2["uv"]); // 追加
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo2);
    gl.vertexAttribPointer(attribute2["position"], 3, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(attribute2["uv"], 2, gl.FLOAT, false, 20, 12);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture2);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo2);

    gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  };
  // 2番描画ここまで

  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // 警告→ [.CommandBufferContext]GL ERROR :GL_INVALID_OPERATION : glDrawElements: attempt to render with no buffer attached to enabled attribute 1
  // 2番の描画を先にすると警告は出ない。
  // attribute変数が多いものを少ないもののあとに描画しようとすると警告が出ると考えられる。原因不明！
  setTimeout(function() {
    console.log("draw1");
    draw1();
  }, 10);
  setTimeout(function() {
    console.log("draw2");
    draw2();
  }, 20);
  setTimeout(function() {
    console.log("draw1");
    draw1();
  }, 30);
  setTimeout(function() {
    console.log("draw2");
    draw2();
  }, 40);
  setTimeout(function() {
    console.log("draw1");
    draw1();
  }, 50);
  setTimeout(function() {
    console.log("draw2");
    draw2();
  }, 60);

};
