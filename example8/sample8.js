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
    var obj12 = phina.asset.AssetManager.get("text", "p12").data;
    var p12 = globj.ObjParser.parse(obj12).defaultObject.groups.defaultGroup;
    var vertices12 = [];
    p12.faces.forEach(function(face) {
      for (var i = 1; i < face.length - 1; i++) {
        vertices12.push(face[0]);
        vertices12.push(face[i + 0]);
        vertices12.push(face[i + 1]);
      }
    });
    var data12 = vertices12.map(function(vertex, i) {
      var p = p12.positions[vertex.position - 1];
      var t = p12.texCoords[vertex.texCoord - 1];
      var n = p12.normals[vertex.normal - 1];
      return [
        // position
        p.x, p.y, p.z,
        // texCoord
        t.u, t.v,
        // normal
        n.x, n.y, n.z
      ];
    }).flatten();

    var obj14 = phina.asset.AssetManager.get("text", "p14").data;
    var p14 = globj.ObjParser.parse(obj14).defaultObject.groups.defaultGroup;
    var vertices14 = [];
    p14.faces.forEach(function(face) {
      for (var i = 1; i < face.length - 1; i++) {
        vertices14.push(face[0]);
        vertices14.push(face[i + 0]);
        vertices14.push(face[i + 1]);
      }
    });
    var data14 = vertices14.map(function(vertex, i) {
      var p = p14.positions[vertex.position - 1];
      var t = p14.texCoords[vertex.texCoord - 1];
      var n = p14.normals[vertex.normal - 1];
      return [
        // position
        p.x, p.y, p.z,
        // texCoord
        t.u, t.v,
        // normal
        n.x, n.y, n.z
      ];
    }).flatten();

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

    var vbo12 = phigl.Vbo(gl).set(data12);
    var vbo14 = phigl.Vbo(gl).set(data14);
    
    var texture12 = phigl.Texture(gl, "p12.png");
    var texture14 = phigl.Texture(gl, "p14.png");

    var drawable = phigl.Drawable(gl, ext)
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

    var mMatrix12 = mat4.translate(mat4.create(), mat4.create(), [10, 0, 0]);
    var mMatrix14 = mat4.translate(mat4.create(), mat4.create(), [-10, 0, 0]);
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
          .setIndexValues(Array.range(vertices12.length))
          .setAttributeVbo(vbo12);
        drawable.uniforms.mMatrix.value = mMatrix12;
        drawable.uniforms.texture.setValue(0).setTexture(texture12);
        drawable.draw();

        drawable
          .setIndexValues(Array.range(vertices14.length))
          .setAttributeVbo(vbo14);
        drawable.uniforms.mMatrix.value = mMatrix14;
        drawable.uniforms.texture.setValue(0).setTexture(texture14);
        drawable.draw();

        gl.flush();

        if (!pause) frame += 1;
      })
      .start();
  };

});
