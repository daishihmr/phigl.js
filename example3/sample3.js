phina.namespace(function() {
  var GL = WebGLRenderingContext;

  phina.main(function() {
    phina.asset.AssetLoader()
      .on("load", function() {
        start();
      })
      .load({
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(GL.DEPTH_TEST);
    gl.depthFunc(GL.LEQUAL);
    gl.enable(GL.BLEND);
    gl.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

    var program = phigl.Program(gl)
      .attach("sample.vs")
      .attach("sample.fs")
      .link();

    var drawable = phigl.InstancedDrawable(gl)
      .setProgram(program)
      .setIndexValues([0, 1, 2, 1, 3, 2])
      .setAttributes("position")
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
        ],
      }, ])
      .setInstanceAttributes("instancePosition")
      .setUniforms("mMatrix", "vMatrix", "pMatrix")
      .on("predraw", function() {
        gl.disable(GL.DEPTH_TEST);
      })
      .on("postdraw", function() {
        gl.enable(GL.DEPTH_TEST);
      });

    var iv = Array.range(0, 20000).map(function() {
      return [Math.randfloat(-600, 600), Math.randfloat(-600, 600), Math.randfloat(-600, 600)];
    }).flatten();
    drawable.setInstanceAttributeData(iv);
    var instanceCount = iv.length / 3;
    console.log("instanceCount = " + instanceCount);

    var dirs = [];
    var a = 0;
    for (var i = 0; i < iv.length; i += 3) {
      var s = Math.randfloat(0, 3);
      a += 0.01;
      dirs[i + 0] = Math.cos(a) * s;
      dirs[i + 1] = Math.sin(a) * s;
      dirs[i + 2] = 0;
    }

    var vMat = mat4.lookAt(mat4.create(), [0, 0, 2000], [0, 0, 0], [0, 1, 0]);
    var pMat = mat4.perspective(mat4.create(), 45, 1 / 1, 0.1, 5000);

    drawable.uniforms.vMatrix.value = vMat;
    drawable.uniforms.pMatrix.value = pMat;

    var mat = mat4.create();
    mat4.translate(mat, mat, [0, 0, 0]);
    mat4.scale(mat, mat, [20, 20, 20]);

    phina.app.BaseApp()
      .enableStats()
      .on("enterframe", function() {
        mat4.rotateZ(mat, mat, 0.04);
        mat4.lookAt(vMat, [Math.sin(this.frame * 0.002) * 2000, 0, Math.cos(this.frame * 0.002) * 2000], [0, 0, 0], [0, 1, 0]);

        gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        for (var i = 0; i < iv.length; i += 3) {
          iv[i + 0] += dirs[i + 0];
          iv[i + 1] += dirs[i + 1];
          if (iv[i + 0] < -600 || 600 < iv[i + 0]) dirs[i + 0] *= -1;
          if (iv[i + 1] < -600 || 600 < iv[i + 1]) dirs[i + 1] *= -1;
        }
        drawable.setInstanceAttributeData(iv);

        drawable.uniforms.mMatrix.value = mat;
        drawable.draw(instanceCount);

        gl.flush();
      })
      .run().fps = 60;
  };

});
