phina.namespace(function() {

  phina.main(function() {
    phina.asset.AssetLoader()
      .on("load", function() {
        start();
      })
      .load({
        image: {
          "sample1.png": "./sample1.png",
          "sample2.png": "./sample2.png",
          "p64.png": "./p64.png",
        },
        vertexShader: {
          "sample.vs": "./sample.vs",
        },
        fragmentShader: {
          "sample.fs": "./sample.fs",
        },
      });

  });

  var start = function() {
    var canvas = document.getElementById("app");
    canvas.width = 512;
    canvas.height = 512;

    var gl = canvas.getContext("webgl");

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    var program = phigl.Program(gl)
      .attach("sample.vs")
      .attach("sample.fs")
      .link();

    var drawable = phigl.Drawable(gl)
      .setProgram(program)
      .setIndexValues([0, 1, 2, 1, 3, 2])
      .declareAttributes("position", "uv")
      .setAttributeDataArray([{
        unitSize: 3,
        data: [
          //
          -0.5, +0.5, 0,
          //
          +0.5, +0.5, 0,
          //
          -0.5, -0.5, 0,
          //
          +0.5, -0.5, 0,
        ]
      }, {
        unitSize: 2,
        data: [
          //
          0, 0,
          //
          1, 0,
          //
          0, 1,
          //
          1, 1,
        ],
      }, ])
      .createVao()
      .declareUniforms("mMatrix", "vMatrix", "pMatrix", "textureA", "textureB");

    drawable.uniforms["vMatrix"].setValue(mat4.lookAt(mat4.create(), [0, 0, 500], [0, 0, 0], [0, 1, 0]));
    drawable.uniforms["pMatrix"].setValue(mat4.ortho(mat4.create(), -512, 512, -512, 512, 0.1, 1000));

    var matA = mat4.create();
    mat4.translate(matA, matA, [0, -120, 0]);
    mat4.scale(matA, matA, [200, 200, 200]);

    var matB = mat4.create();
    mat4.translate(matB, matB, [0, 120, 0]);
    mat4.scale(matB, matB, [200, 200, 200]);

    var tex0 = phigl.Texture(gl, "p64.png");
    var tex1 = phigl.Texture(gl, "sample1.png");
    var tex2 = phigl.Texture(gl, "sample2.png");

    phina.util.Ticker()
      .on("tick", function() {
        mat4.rotateZ(matA, matA, 0.04);
        mat4.rotateX(matB, matB, 0.04);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        drawable.uniforms["mMatrix"].setValue(matA);
        drawable.uniforms["textureA"].setValue(0).setTexture(tex0);
        drawable.uniforms["textureB"].setValue(1).setTexture(tex1);
        drawable.draw();

        drawable.uniforms["mMatrix"].setValue(matB);
        drawable.uniforms["textureA"].setValue(0).setTexture(tex0);
        drawable.uniforms["textureB"].setValue(1).setTexture(tex2);
        drawable.draw();

        gl.flush();
      })
      .start();
  };

});
