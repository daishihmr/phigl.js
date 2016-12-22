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
          "sample2a.vs": "./sample2a.vs",
          "sample2b.vs": "./sample2b.vs",
        },
        fragmentShader: {
          "sample2a.fs": "./sample2a.fs",
          "sample2b.fs": "./sample2b.fs",
        },
      });

  });

  var start = function() {

    var canvas = document.getElementById("app");
    canvas.width = 512;
    canvas.height = 512;

    var gl = canvas.getContext("webgl");

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.cullFace(gl.FRONT);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    var programA = phigl.Program(gl)
      .attach("sample2a.vs")
      .attach("sample2a.fs")
      .link();
    var obj = phigl.Drawable(gl)
      .setProgram(programA)
      .setIndexValues([0, 1, 2, 1, 3, 2])
      .setAttributes("position", "uv")
      .setAttributeDataArray([{
        unitSize: 3,
        data: [
          //
          -1, 1, 0,
          //
          1, 1, 0,
          //
          -1, -1, 0,
          //
          1, -1, 0,
        ],
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

    obj.uniforms.texture.setValue(0).setTexture(phigl.Texture(gl, "sample.png"));

    var framebuffer = phigl.Framebuffer(gl, 512, 512);

    var programB = phigl.Program(gl)
      .attach("sample2b.vs")
      .attach("sample2b.fs")
      .link();
    var screen = phigl.Drawable(gl)
      .setProgram(programB)
      .setIndexValues([0, 1, 2, 1, 3, 2])
      .setAttributes("position", "uv")
      .setAttributeDataArray([{
        unitSize: 3,
        data: [
          //
          -1, 1, 0,
          //
          1, 1, 0,
          //
          -1, -1, 0,
          //
          1, -1, 0,
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
      .createVao()
      .setUniforms("texture");

    screen.uniforms.texture.setValue(0).setTexture(framebuffer.texture);

    var matM0 = mat4.create();
    mat4.translate(matM0, matM0, [-256, -256, 0]);
    mat4.scale(matM0, matM0, [100, 100, 100]);

    var matM1 = mat4.create();
    mat4.translate(matM1, matM1, [256, -256, 0]);
    mat4.scale(matM1, matM1, [100, 100, 100]);

    var matM2 = mat4.create();
    mat4.translate(matM2, matM2, [-256, 256, 0]);
    mat4.scale(matM2, matM2, [100, 100, 100]);

    var matM3 = mat4.create();
    mat4.translate(matM3, matM3, [256, 256, 0]);
    mat4.scale(matM3, matM3, [100, 100, 100]);

    var matV = mat4.create();
    mat4.lookAt(matV, [0, 0, 500], [0, 0, 0], [0, 1, 0]);

    var matP = mat4.create();
    mat4.ortho(matP, -512, 512, -512, 512, 0.1, 1000);

    phina.util.Ticker()
      .on("tick", function() {
        mat4.rotateZ(matM0, matM0, 0.1);
        mat4.rotateZ(matM1, matM1, 0.2);
        mat4.rotateZ(matM2, matM2, -0.1);
        mat4.rotateZ(matM3, matM3, -0.2);

        framebuffer.bind(0, 0, 512, 512);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        obj.uniforms.vMatrix.value = matV;
        obj.uniforms.pMatrix.value = matP;

        obj.uniforms.mMatrix.value = matM0;
        obj.draw();

        obj.uniforms.mMatrix.value = matM1;
        obj.draw();

        obj.uniforms.mMatrix.value = matM2;
        obj.draw();

        obj.uniforms.mMatrix.value = matM3;
        obj.draw();
        
        gl.flush();

        phigl.Framebuffer.unbind(gl);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        screen.draw();

        gl.flush();
      })
      .start();
  };

});
