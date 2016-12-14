phina.namespace(function() {

  phina.main(function() {
    phina.asset.AssetLoader()
      .on("load", function() {
        start();
      })
      .load({
        text: {
          "obj": "./../../gl-obj.js/test/fighter.obj",
        },
        image: {
          "p64.png": "./../../gl-obj.js/test/fighter.png",
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
    var attr = globj.AttributeBuilder.build(obj);

    var canvas = document.getElementById("app");
    canvas.width = 960;
    canvas.height = 640;

    var gl = canvas.getContext("webgl");

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.clearColor(1.0, 0.8, 0.95, 1.0);
    gl.clearDepth(1.0);
    gl.cullFace(gl.BACK);
    gl.depthFunc(gl.LEQUAL);

    var instanceData = Array.range(-20, 20).map(function(x) {
      return Array.range(-15, 15).map(function(y) {
        return [
          // position
          x * 10, 0, y * 10,
          // rotation
          Math.random() * Math.PI * 2,
        ];
      }).flatten();
    }).flatten();

    var drawable = phigl.Drawable(gl)
      .setDrawMode(gl.TRIANGLES)
      .setProgram(phigl.Program(gl).attach("sample.vs").attach("sample.fs").link())
      .setIndexValues(attr.indices)
      .setAttributes("position", "uv", "normal")
      .setAttributeData(attr.attr)
      .setUniforms(
        "mMatrix",
        "vpMatrix",
        "lightDirection",
        "diffuseColor",
        "ambientColor",
        "texture"
      );

    drawable.uniforms.texture.setValue(0).setTexture(phigl.Texture(gl, "p64.png"));

    var cameraPos = [Math.cos(1) * 200, 50, Math.sin(1) * 200];
    var cameraTarget = [0, 10, 0];

    var mMatrix = mat4.create();
    var vMatrix = mat4.lookAt(mat4.create(), cameraPos, cameraTarget, [0, 1, 0]);
    var pMatrix = mat4.perspective(mat4.create(), 45, 960 / 640, 0.1, 10000);
    var vpMatrix = mat4.multiply(mat4.create(), pMatrix, vMatrix);
    var lightDirection = vec3.normalize(vec3.create(), [1, 0.1, 0]);

    var frame = 0;
    var pause = false;
    document.body.onclick = function() {
      pause = !pause;
    };
    var stats = new Stats();
    document.body.appendChild(stats.dom);
    phina.util.Ticker()
      .on("tick", function() {
        stats.begin();

        cameraPos = [Math.cos(frame * 0.01) * 50, 20, Math.sin(frame * 0.01) * 50];

        mat4.lookAt(vMatrix, cameraPos, cameraTarget, [0, 1, 0]);
        mat4.multiply(vpMatrix, pMatrix, vMatrix);

        drawable.uniforms.vpMatrix.value = vpMatrix;
        drawable.uniforms.lightDirection.value = lightDirection;
        drawable.uniforms.diffuseColor.value = [0.7, 0.7, 0.7, 1.0];
        drawable.uniforms.ambientColor.value = [0.7, 0.7, 0.7, 1.0];

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for (var i = 0; i < instanceData.length / 4; i++) {
          instanceData[i * 4 + 3] += -0.08;
          mat4.identity(mMatrix);
          mat4.translate(mMatrix, mMatrix, [instanceData[i * 4 + 0], instanceData[i * 4 + 1], instanceData[i * 4 + 2]]);
          mat4.rotateY(mMatrix, mMatrix, instanceData[i * 4 + 3]);
          drawable.uniforms.mMatrix.value = mMatrix;
          drawable.draw();
        }

        gl.flush();

        if (!pause) frame += 1;
        
        stats.end();
      })
      .start()
      .fps = 60;
  };

});
