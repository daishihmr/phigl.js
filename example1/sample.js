phina.namespace(function() {

  var GL = WebGLRenderingContext;

  phina.main(function() {
    phina.asset.AssetLoader()
      .on("load", function() {
        start();
      })
      .load({
        image: {
          "sample1.png": "./sample1.png",
          "sample2.png": "./sample2.png",
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
    gl.enable(GL.CULL_FACE);
    gl.enable(GL.BLEND);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.depthFunc(GL.LEQUAL);
    gl.cullFace(GL.FRONT);
    gl.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);

    var program = phigl.Program(gl)
      .attach("sample.vs")
      .attach("sample.fs")
      .link();

    var drawable = phigl.Drawable(gl)
      .setProgram(program)
      .setIndexValues([0, 1, 2, 1, 3, 2])
      .setAttributes("position", "uv")
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
      .setUniforms("mMatrix", "vMatrix", "pMatrix", "textureA", "textureB");

    drawable.uniforms.vMatrix.value = mat4.lookAt(mat4.create(), [0, 0, 500], [0, 0, 0], [0, 1, 0]);
    drawable.uniforms.pMatrix.value = mat4.ortho(mat4.create(), -512, 512, -512, 512, 0.1, 1000);

    drawable.uniforms.textureA.setValue(0).setTexture(phigl.Texture(gl, "sample1.png"));
    drawable.uniforms.textureB.setValue(1).setTexture(phigl.Texture(gl, "sample2.png"));

    var matA = mat4.create();
    mat4.translate(matA, matA, [0, -100, 0]);
    mat4.scale(matA, matA, [100, 100, 100]);

    var matB = mat4.create();
    mat4.translate(matB, matB, [0, 100, 0]);
    mat4.scale(matB, matB, [150, 150, 150]);

    phina.util.Ticker()
      .on("tick", function() {
        mat4.rotateZ(matA, matA, 0.04);
        mat4.rotateX(matB, matB, 0.04);

        gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        drawable.uniforms.mMatrix.value = matA;
        drawable.draw();

        drawable.uniforms.mMatrix.value = matB;
        drawable.draw();

        gl.flush();
      })
      .start();;
  };

});
