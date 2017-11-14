phina.namespace(function() {

  phina.main(function() {
    phina.asset.AssetLoader()
      .on("load", function() {
        start();
      })
      .load({
        text: {
          "p12": "./p12.obj",
          "p14": "./p14.obj",
        },
        image: {
          "p12.png": "./p12.png",
          "p14.png": "./p14.png",
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
    canvas.width = 960;
    canvas.height = 640;

    var gl = canvas.getContext("webgl");

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.cullFace(gl.BACK);
    gl.depthFunc(gl.LEQUAL);

    var vbo12 = createObjData("p12", gl);
    var vbo14 = createObjData("p14", gl);
    
    var indices12 = phigl.Ibo(gl).set(Array.range(vbo12.dataLength));
    var indices14 = phigl.Ibo(gl).set(Array.range(vbo14.dataLength));

    var texture12 = phigl.Texture(gl, "p12.png");
    var texture14 = phigl.Texture(gl, "p14.png");

    var drawable = phigl.Drawable(gl)
      .setProgram(phigl.Program(gl).attach("sample.vs").attach("sample.fs").link())
      .setDrawMode(gl.TRIANGLES)
      .setAttributes("position", "uv", "normal")
      .setUniforms(
        "mMatrix",
        "vpMatrix",
        "lightDirection",
        "diffuseColor",
        "ambientColor",
        "texture"
      );

    var cameraPos = [Math.cos(0) * 100, 50, Math.sin(0) * 100];
    var cameraTarget = [0, 10, 0];

    var mMatrix12 = mat4.create();
    var mMatrix14 = mat4.create();
    mat4.translate(mMatrix12, mMatrix12, [10, 0, 0]);
    mat4.translate(mMatrix14, mMatrix14, [-10, 0, 0]);
    var vMatrix = mat4.lookAt(mat4.create(), cameraPos, cameraTarget, [0, 1, 0]);
    var pMatrix = mat4.perspective(mat4.create(), 45, canvas.width / canvas.height, 0.1, 10000);
    var vpMatrix = mat4.multiply(mat4.create(), pMatrix, vMatrix);
    var lightDirection = vec3.normalize(vec3.create(), [1, 0.1, 0]);

    var frame = 0;
    var pause = false;
    phina.util.Ticker()
      .on("tick", function() {
        cameraPos = [Math.cos(frame * 0.01) * 30, 5, Math.sin(frame * 0.01) * 30];

        mat4.lookAt(vMatrix, cameraPos, cameraTarget, [0, 1, 0]);
        mat4.multiply(vpMatrix, pMatrix, vMatrix);

        drawable.uniforms.vpMatrix.value = vpMatrix;
        drawable.uniforms.lightDirection.value = lightDirection;
        drawable.uniforms.diffuseColor.value = [0.7, 0.7, 0.7, 1.0];
        drawable.uniforms.ambientColor.value = [0.7, 0.7, 0.7, 1.0];

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        drawable
          .setIndexBuffer(indices12)
          .setAttributeVbo(vbo12);
        drawable.uniforms.mMatrix.value = mMatrix12;
        drawable.uniforms.texture.setValue(0).setTexture(texture12);
        drawable.draw();

        drawable
          .setIndexBuffer(indices14)
          .setAttributeVbo(vbo14);
        drawable.uniforms.mMatrix.value = mMatrix14;
        drawable.uniforms.texture.setValue(0).setTexture(texture14);
        drawable.draw();

        gl.flush();

        if (!pause) frame += 1;
      })
      .start();
  };

  var createObjData = function(name, gl) {
    var obj = phina.asset.AssetManager.get("text", name).data;
    var group = globj.ObjParser.parse(obj).defaultObject.groups.defaultGroup;
    var vertices = [];
    group.faces.forEach(function(face) {
      for (var i = 1; i < face.length - 1; i++) {
        vertices.push(face[0]);
        vertices.push(face[i + 0]);
        vertices.push(face[i + 1]);
      }
    });
    var data = vertices.map(function(vertex, i) {
      var p = group.positions[vertex.position - 1];
      var t = group.texCoords[vertex.texCoord - 1];
      var n = group.normals[vertex.normal - 1];
      return [
        // position
        p.x, p.y, p.z,
        // texCoord
        t.u, t.v,
        // normal
        n.x, n.y, n.z
      ];
    }).flatten();

    var result = phigl.Vbo(gl).set(data);
    result.dataLength = vertices.length;
    return result;
  };

});
