phina.namespace(function() {

  phina.main(function() {
    phina.asset.AssetLoader()
      .on("load", function() {
        start();
      })
      .load({
        text: {
          "obj": "./p64.obj",
        },
        image: {
          "sample.png": "./sample.png",
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
    var data = phina.asset.AssetManager.get("text", "obj").data;
    var obj = globj.ObjParser.parse(data);
    console.log(obj);

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
      .setUniforms("mMatrix", "vMatrix", "pMatrix", "texture");

    drawable.uniforms.vMatrix.value = mat4.lookAt(mat4.create(), [0, 100, 500], [0, 0, 0], [0, 1, 0]);
    drawable.uniforms.pMatrix.value = mat4.perspective(mat4.create(), 45, 1, 0.1, 1000);

    drawable.uniforms.texture.setValue(0).setTexture(phigl.Texture(gl, "sample.png"));

    var mMatrix = mat4.create();
    mat4.translate(mMatrix, mMatrix, [0, 0, 0]);
    mat4.scale(mMatrix, mMatrix, [300, 300, 300]);

    phina.util.Ticker()
      .on("tick", function() {
        mat4.rotateY(mMatrix, mMatrix, 0.04);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        drawable.uniforms.mMatrix.value = mMatrix;
        drawable.draw();

        gl.flush();
      })
      .start();;
  };

});
