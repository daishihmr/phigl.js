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
    var data = phina.asset.AssetManager.get("text", "obj").data;
    var obj = globj.ObjParser.parse(data).defaultObject.groups.defaultGroup;
    // console.log(obj);

    var canvas = document.getElementById("app");
    canvas.width = 512;
    canvas.height = 512;

    var gl = canvas.getContext("webgl");

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.cullFace(gl.BACK);
    gl.depthFunc(gl.LEQUAL);

    var drawable = phigl.Drawable(gl)
      .setDrawMode(gl.TRIANGLES)
      .setProgram(phigl.Program(gl).attach("sample.vs").attach("sample.fs").link())
      .setIndexValues(Array.range(obj.trigons.length))
      .declareAttributes("position", "uv", "normal")
      .setAttributeData(obj.trigons.map(function(vertex, i) {
        var p = obj.positions[vertex.position - 1];
        var t = obj.texCoords[vertex.texCoord - 1];
        var n = obj.normals[vertex.normal - 1];
        return [
          // position
          p.x, p.y, p.z,
          // texCoord
          t.u, t.v,
          // normal
          n.x, n.y, n.z
        ];
      }).flatten())
      .createVao()
      .declareUniforms(
        "mvpMatrix",
        "invMatrix",
        "lightDirection",
        "diffuseColor",
        "ambientColor",
        "texture"
      );

    drawable.uniforms["texture"].setValue(0).setTexture(phigl.Texture(gl, "p64.png"));

    var cameraPos = [0, 15, 30];
    var cameraTarget = [0, 10, 0];

    var vMatrix = mat4.lookAt(mat4.create(), cameraPos, cameraTarget, [0, 1, 0]);
    var pMatrix = mat4.perspective(mat4.create(), 45, 1, 0.1, 100);
    var vpMatrix = mat4.multiply(mat4.create(), pMatrix, vMatrix);
    var mvpMatrix = mat4.create();
    var invMatrix = mat4.create();
    var lightDirection = vec3.normalize(vec3.create(), [0, -1, 0.005]);

    var mMatrix = mat4.create();
    mat4.translate(mMatrix, mMatrix, [0, 0, 0]);
    mat4.scale(mMatrix, mMatrix, [1, 1, 1]);

    phina.util.Ticker()
      .on("tick", function() {
        mat4.rotateY(mMatrix, mMatrix, 0.01);

        mat4.multiply(mvpMatrix, vpMatrix, mMatrix);
        mat4.invert(invMatrix, mvpMatrix);

        drawable.uniforms["mvpMatrix"].setValue(mvpMatrix);
        drawable.uniforms["invMatrix"].setValue(invMatrix);
        drawable.uniforms["lightDirection"].setValue(lightDirection);
        drawable.uniforms["diffuseColor"].setValue([1.00, 1.00, 1.00, 1.0]);
        drawable.uniforms["ambientColor"].setValue([0.01, 0.01, 0.01, 1.0]);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        drawable.draw();

        gl.flush();
      })
      .start();
  };

});
