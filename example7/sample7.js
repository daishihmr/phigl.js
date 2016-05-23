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
    var obj = globj.ObjParser.parse(data).defaultObject.groups.defaultGroup;

    var canvas = document.getElementById("app");
    canvas.width = 960;
    canvas.height = 640;

    var gl = canvas.getContext("webgl");
    var ext = phigl.Extensions.getInstancedArrays(gl);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.clearColor(1.0, 0.8, 0.95, 1.0);
    gl.clearDepth(1.0);
    gl.cullFace(gl.BACK);
    gl.depthFunc(gl.LEQUAL);

    var trigons = [];
    obj.faces.forEach(function(face) {
      for (var i = 1; i < face.length - 1; i++) {
        trigons.push(face[0]);
        trigons.push(face[i + 0]);
        trigons.push(face[i + 1]);
      }
    });

    var instanceData = Array.range(-13, 13).map(function(x) {
      return Array.range(-13, 13).map(function(y) {
        return [
          // position
          x * 30, Math.randfloat(-50, 50), y * 30,
          // rotation
          Math.random() * Math.PI * 2,
        ];
      }).flatten();
    }).flatten();

    var drawable = phigl.InstancedDrawable(gl, ext)
      .setDrawMode(gl.TRIANGLES)
      .setProgram(phigl.Program(gl).attach("sample.vs").attach("sample.fs").link())
      .setIndexValues(Array.range(trigons.length))
      .setAttributes("position", "uv", "normal")
      .setAttributeData(trigons.map(function(vertex, i) {
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
      .setInstanceAttributes("instancePosition", "instanceRotationY")
      .setInstanceAttributeData(instanceData)
      .setUniforms(
        "vpMatrix",
        "lightDirection",
        "diffuseColor",
        "ambientColor",
        "texture"
      );

    drawable.uniforms.texture.setValue(0).setTexture(phigl.Texture(gl, "p64.png"));

    var cameraPos = [Math.cos(1) * 200, 50, Math.sin(1) * 200];
    var cameraTarget = [0, 10, 0];

    var vMatrix = mat4.lookAt(mat4.create(), cameraPos, cameraTarget, [0, 1, 0]);
    var pMatrix = mat4.perspective(mat4.create(), 45, 960 / 640, 0.1, 10000);
    var vpMatrix = mat4.multiply(mat4.create(), pMatrix, vMatrix);
    var lightDirection = vec3.normalize(vec3.create(), [1, 0.1, 0]);

    var frame = 0;
    var pause = false;
    document.body.onclick = function() {
      pause = !pause;
    };
    phina.util.Ticker()
      .on("tick", function() {
        cameraPos = [Math.cos(frame * 0.01) * 200, 50, Math.sin(frame * 0.01) * 200];

        mat4.lookAt(vMatrix, cameraPos, cameraTarget, [0, 1, 0]);
        mat4.multiply(vpMatrix, pMatrix, vMatrix);

        drawable.uniforms.vpMatrix.value = vpMatrix;
        drawable.uniforms.lightDirection.value = lightDirection;
        drawable.uniforms.diffuseColor.value = [0.7, 0.7, 0.7, 1.0];
        drawable.uniforms.ambientColor.value = [0.7, 0.7, 0.7, 1.0];

        for (var i = 0, j = 0; i < instanceData.length; i += 4, j++) {
          instanceData[i + 3] += -0.08 * ((j % 3) - 1);
        }
        drawable.setInstanceAttributeData(instanceData);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        drawable.draw(instanceData.length / 4);

        gl.flush();

        if (!pause) frame += 1;
      })
      .start();
  };

});
