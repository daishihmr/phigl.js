phina.namespace(function() {

  phina.main(function() {
    phina.asset.AssetLoader()
      .on("load", function() {
        start();
      })
      .load({
        image: {
          "sample.png": "./sample.png",
        },
        vertexShader: {
          "sample1.vs": "./sample2.vs", // 逆にしてる
          "sample2.vs": "./sample1.vs",
        },
        fragmentShader: {
          "sample1.fs": "./sample2.fs",
          "sample2.fs": "./sample1.fs",
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

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    var drawable1 = phigl.Drawable(gl)
      .setProgram(phigl.Program(gl).attach("sample1.vs").attach("sample1.fs").link())
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
      .declareUniforms("mMatrix", "vMatrix", "pMatrix", "texture");

    drawable1.uniforms["vMatrix"].setValue(vMatrix);
    drawable1.uniforms["pMatrix"].setValue(pMatrix);
    drawable1.uniforms["texture"].setValue(0).setTexture(phigl.Texture(gl, "sample.png"));

    var mMat1 = mat4.create();
    mat4.translate(mMat1, mMat1, [0, 200, 0]);
    mat4.scale(mMat1, mMat1, [300, 300, 300]);

    var drawable2 = phigl.Drawable(gl)
      .setProgram(phigl.Program(gl).attach("sample2.vs").attach("sample2.fs").link())
      .setIndexValues([0, 1, 2, 1, 3, 2])
      .setAttributes("noitisop")
      .setAttributeDataArray([{
        unitSize: 2,
        data: [
          //
          -0.5, +0.5,
          //
          +0.5, +0.5,
          //
          -0.5, -0.5,
          //
          +0.5, -0.5,
        ]
      }, ])
      .setUniforms("mMatrix", "vMatrix", "pMatrix");

    drawable2.uniforms["vMatrix"].setValue(vMatrix);
    drawable2.uniforms["pMatrix"].setValue(pMatrix);

    var mMat2 = mat4.create();
    mat4.translate(mMat2, mMat2, [0, -200, 0]);
    mat4.scale(mMat2, mMat2, [300, 300, 300]);

    phina.util.Ticker()
      .on("tick", function() {
        mat4.rotateZ(mMat1, mMat1, 0.04);
        mat4.rotateZ(mMat2, mMat2, -0.06);
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        drawable2.uniforms["mMatrix"].setValue(mMat2);
        drawable2.draw();

        drawable1.uniforms["mMatrix"].setValue(mMat1);
        drawable1.draw();

        gl.flush();
      })
      .start();;
  };

});
