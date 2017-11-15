phina.namespace(function() {
  var enable1 = true;
  var enable2 = true;

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
          "sample1.vs": "./sample1.vs",
          "sample2.vs": "./sample2.vs",
        },
        fragmentShader: {
          "sample1.fs": "./sample1.fs",
          "sample2.fs": "./sample2.fs",
        },
      });
  });

  var start = function() {
    var canvas = document.getElementById("app");
    canvas.width = 512;
    canvas.height = 512;

    var range = 1000;
    var vMat = mat4.lookAt(mat4.create(), [0, 0, 2000], [0, 0, 0], [0, 1, 0]);
    var pMat = mat4.perspective(mat4.create(), 45, 1, 0.1, 5000);
    var mat = mat4.create();
    mat4.translate(mat, mat, [0, 0, 0]);
    mat4.scale(mat, mat, [60, 60, 60]);

    var gl = canvas.getContext("webgl");
    var ext = phigl.Extensions.getInstancedArrays(gl);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    if (enable1) {
      var drawable1 = phigl.InstancedDrawable(gl, ext)
        .setProgram(phigl.Program(gl).attach("sample1.vs").attach("sample1.fs").link())
        .setIndexValues([0, 1, 2, 1, 3, 2])
        .declareAttributes("position")
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
        .declareInstanceAttributes("instancePosition", "rotY")
        .declareUniforms("mMatrix", "vMatrix", "pMatrix")
        .on("predraw", function() {
          gl.disable(gl.DEPTH_TEST);
        })
        .on("postdraw", function() {
          gl.enable(gl.DEPTH_TEST);
        });

      var instanceCount1 = 1200;
      var instances1 = Array.range(0, instanceCount1).map(function() {
        return [Math.randfloat(-range, range), Math.randfloat(-range, range), Math.randfloat(-range, range), Math.randfloat(0, Math.PI * 2)];
      }).flatten();
      drawable1.setInstanceAttributeData(instances1);
      var dirs1 = [];
      for (var i = 0; i < instances1.length; i += 4) {
        dirs1[i + 0] = Math.randfloat(-6, 6);
        dirs1[i + 1] = Math.randfloat(-6, 6);
        dirs1[i + 2] = Math.randfloat(-6, 6);
        dirs1[i + 3] = Math.randfloat(-0.02, 0.02);
      }

      drawable1.uniforms["vMatrix"].setValue(vMat);
      drawable1.uniforms["pMatrix"].setValue(pMat);
      drawable1.uniforms["mMatrix"].setValue(mat);
    }

    if (enable2) {
      var drawable2 = phigl.InstancedDrawable(gl, ext)
        .setProgram(phigl.Program(gl).attach("sample2.vs").attach("sample2.fs").link())
        .setIndexValues([0, 1, 2, 1, 3, 2])
        .declareAttributes("noitisop", "uv")
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
        }, {
          unitSize: 2,
          data: [
            //
            0, 1,
            //
            1, 1,
            //
            0, 0,
            //
            1, 0,
          ],
        }, ])
        .declareInstanceAttributes("instancePosition", "rotY")
        .declareUniforms("mMatrix", "vMatrix", "pMatrix", "texture")
        .on("predraw", function() {
          gl.disable(gl.DEPTH_TEST);
        })
        .on("postdraw", function() {
          gl.enable(gl.DEPTH_TEST);
        });

      var instanceCount2 = 100;
      var instances2 = Array.range(0, instanceCount2).map(function() {
        return [
          Math.randfloat(-range, range),
          Math.randfloat(-range, range),
          Math.randfloat(-range, range),
          Math.randfloat(0, Math.PI * 2),
        ];
      }).flatten();
      drawable2.setInstanceAttributeData(instances2);
      var dirs2 = [];
      for (var i = 0; i < instances2.length; i += 4) {
        dirs2[i + 0] = Math.randfloat(-6, 6);
        dirs2[i + 1] = Math.randfloat(-6, 6);
        dirs2[i + 2] = Math.randfloat(-6, 6);
        dirs2[i + 3] = Math.randfloat(-0.01, 0.01);
      }

      drawable2.uniforms["vMatrix"].setValue(vMat);
      drawable2.uniforms["pMatrix"].setValue(pMat);
      drawable2.uniforms["mMatrix"].setValue(mat);
      drawable2.uniforms["texture"].setValue(0).setTexture(phigl.Texture(gl, "sample.png"));
    }

    phina.app.BaseApp()
      .enableStats()
      .on("enterframe", function() {
        mat4.lookAt(vMat, [Math.sin(this.frame * 0.004) * 1000, 0, Math.cos(this.frame * 0.004) * 3000], [0, 0, 0], [0, 1, 0]);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (enable1) {
          for (var i = 0; i < instances1.length; i += 4) {
            instances1[i + 0] += dirs1[i + 0];
            instances1[i + 1] += dirs1[i + 1];
            instances1[i + 2] += dirs1[i + 2];
            if (instances1[i + 0] < -range || range < instances1[i + 0]) dirs1[i + 0] *= -1;
            if (instances1[i + 1] < -range || range < instances1[i + 1]) dirs1[i + 1] *= -1;
            if (instances1[i + 2] < -range || range < instances1[i + 2]) dirs1[i + 2] *= -1;
            instances1[i + 3] += dirs1[i + 3];
          }
          drawable1.setInstanceAttributeData(instances1);
          drawable1.draw(instanceCount1);
        }

        if (enable2) {
          for (var i = 0; i < instances2.length; i += 4) {
            instances2[i + 0] += dirs2[i + 0];
            instances2[i + 1] += dirs2[i + 1];
            instances2[i + 2] += dirs2[i + 2];
            if (instances2[i + 0] < -range || range < instances2[i + 0]) dirs2[i + 0] *= -1;
            if (instances2[i + 1] < -range || range < instances2[i + 1]) dirs2[i + 1] *= -1;
            if (instances2[i + 2] < -range || range < instances2[i + 2]) dirs2[i + 2] *= -1;
            instances1[i + 3] += dirs1[i + 3];
          }
          drawable2.setInstanceAttributeData(instances2);
          drawable2.draw(instanceCount2);
        }

        gl.flush();
      })
      .run().fps = 60;
  };

});
