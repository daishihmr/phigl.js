phina.namespace(function () {

  phina.main(function () {
    phina.asset.AssetLoader()
      .on("load", function () {
        start();
      })
      .load({
        image: {
          "sample1.png": "./test.png",
        },
        vertexShader: {
          "sample.vs": "./sample.vs",
        },
        fragmentShader: {
          "sample.fs": "./sample.fs",
        },
      });
  });

  const start = function () {
    const canvas = document.getElementById("app");
    canvas.width = 300;
    canvas.height = 400;
    canvas.style.width = "600px";
    canvas.style.height = "800px";

    const gl = canvas.getContext("webgl", { antialias: false });
    const ext = phigl.Extensions.getInstancedArrays(gl);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    gl.clearColor(0.2, 0.4, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const program = phigl.Program(gl)
      .attach("sample.vs")
      .attach("sample.fs")
      .link();

    const drawable = phigl.InstancedDrawable(gl, ext)
      .setProgram(program)
      .setIndexValues([0, 1, 2, 1, 3, 2])
      .declareAttributes("position", "uv")
      .setAttributeDataArray([{
        unitSize: 2,
        data: [
          0, 1,
          1, 1,
          0, 0,
          1, 0,
        ]
      }, {
        unitSize: 2,
        data: [
          0, 1,
          1, 1,
          0, 0,
          1, 0,
        ],
      },])
      .createVao()
      .declareInstanceAttributes(
        "instanceActive",
        "instanceUvMatrix0",
        "instanceUvMatrix1",
        "instanceUvMatrix2",
        "instancePosition",
        "instanceSize",
        "cameraMatrix0",
        "cameraMatrix1",
        "cameraMatrix2",
      )
      .declareUniforms("screenSize", "texture");

    const count = 10000;
    const R = phina.util.Random();
    const iv = Array.range(0, count).map((idx) => {
      const texX = 0;
      const texY = 0;
      const texW = 256;
      const texH = 256;

      const uvm = phina.geom.Matrix33();
      uvm.m00 = texW / 256;
      uvm.m01 = 0;
      uvm.m10 = 0;
      uvm.m11 = texH / 256;
      uvm.m02 = texX / 256;
      uvm.m12 = texY / 256;

      const angle = (0).toRadian();
      const scaleX = 1;
      const scaleY = 1;

      const m = phina.geom.Matrix33();
      m.m00 = Math.cos(angle) * scaleX;
      m.m01 = -Math.sin(angle) * scaleY;
      m.m10 = Math.sin(angle) * scaleX;
      m.m11 = Math.cos(angle) * scaleY;
      m.m02 = R.randint(0, 300); // x
      m.m12 = R.randint(0, 400); // y

      return [
        // active
        true,
        // uv matrix
        uvm.m00, uvm.m10,
        uvm.m01, uvm.m11,
        uvm.m02, uvm.m12,
        // sprite position
        -16 * 0.5, -16 * 1, 0,
        // sprite size
        16, 16,
        // camera matrix
        m.m00, m.m10,
        m.m01, m.m11,
        m.m02, m.m12,
      ];
    }).flatten();
    drawable.setInstanceAttributeData(iv);

    drawable.uniforms["screenSize"].setValue([300, 400]);
    const texture = phigl.Texture(gl, "sample1.png");
    drawable.uniforms["texture"].setValue(0).setTexture(texture);

    phina.app.BaseApp()
      .enableStats()
      .on("enterframe", function () {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        drawable.setInstanceAttributeData(iv);
        drawable.draw(count);

        gl.flush();
      })
      .run().fps = 60;
  };

});
