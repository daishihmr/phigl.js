(function(global) {

  var ObjParser;
  var MtlParser;

  (function() {

    ObjParser = {};

    var ptnObject = /^o (.+)$/;
    var ptnGroup = /^g (.+)$/;
    var ptnSmoothShading = /^s (.+)$/;
    var ptnPosition = /^v (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)$/;
    var ptnTexCoord = /^vt (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)$/;
    var ptnNormal = /^vn (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)$/;
    var ptnFace2 = /^f(?: -?\d+\/-?\d+)+$/;
    var ptnFace3 = /^f(?: -?\d+\/-?\d*\/-?\d+)+$/;

    ObjParser.parse = function(data) {
      this.lines = data.split("\n").map(function(line) {
        return line.trim();
      });
      this.cur = 0;

      var objects = {
        defaultObject: {
          groups: {
            defaultGroup: {
              positions: [],
              texCoords: [],
              normals: [],
              faces: [],
            },
          },
        },
      };

      var o = objects.defaultObject;
      var g = o.groups.defaultGroup;
      var len = this.lines.length;
      var m;
      while (this.cur < len) {
        var line = this.lines[this.cur];
        if (line.match(ptnObject)) {
          o = objects[line.substring(2)] = {
            groups: {
              defaultGroup: {
                positions: [],
                texCoords: [],
                normals: [],
                faces: [],
              },
            },
          };
          if (g) trianglate(g);
          g = o.groups.defaultGroup;
        } else if (line.match(ptnGroup)) {
          if (g) trianglate(g);
          g = o.groups[line.substring(2)] = {
            positions: [],
            texCoords: [],
            normals: [],
            faces: [],
          };
        } else if (line.match(ptnSmoothShading)) {
          var value = line.substring(2);
          if (value == "off") {
            g.smoothShading = false;
          } else {
            g.smoothShading = true;
          }
        } else if (m = line.match(ptnPosition)) {
          g.positions.push({
            x: +m[1],
            y: +m[2],
            z: +m[3],
          });
        } else if (m = line.match(ptnTexCoord)) {
          g.texCoords.push({
            u: +m[1],
            v: +m[2],
          });
        } else if (m = line.match(ptnNormal)) {
          g.normals.push({
            x: +m[1],
            y: +m[2],
            z: +m[3],
          });
        } else if (line.match(ptnFace2)) {
          var face = [];
          var vertices = line.substring(2).split(" ");
          vertices.forEach(function(vertex) {
            var elm = vertex.split("/");
            face.push({
              position: ~~elm[0],
              texCoord: ~~elm[1],
            });
          });
          g.faces.push(face);
        } else if (line.match(ptnFace3)) {
          var face = [];
          var vertices = line.substring(2).split(" ");
          vertices.forEach(function(vertex) {
            var elm = vertex.split("/");
            face.push({
              position: ~~elm[0],
              texCoord: ~~elm[1],
              normal: ~~elm[2],
            });
          });
          g.faces.push(face);
        }

        this.cur += 1;
      }
      
      if (g) trianglate(g);

      return objects;
    };
    
    var trianglate = function(group) {
      var trigons = [];
      group.faces.forEach(function(face) {
        for (var i = 1; i < face.length - 1; i++) {
          trigons.push(face[0]);
          trigons.push(face[i + 0]);
          trigons.push(face[i + 1]);
        }
      });
      group.trigons = trigons;
    };

  })();

  (function() {

    MtlParser = {};
    
    var ptnNewMaterial = /^newmtl (.+)$/
    var ptnAmbient = /^Ka (\d+(?:\.\d+)?) (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)$/;
    var ptnAmbientMap = /^map_Ka (.+)$/;
    var ptnDiffuse = /^Kd (\d+(?:\.\d+)?) (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)$/;
    var ptnDiffuseMap = /^map_Kd (.+)$/;
    var ptnSpecular3 = /^Ks (\d+(?:\.\d+)?) (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)$/;
    var ptnSpecular3Map = /^map_Ks (.+)$/;
    var ptnSpecular1 = /^Ns (\d+(?:\.\d+)?)$/;
    var ptnSpecular1Map = /^map_Ns (.+)$/;
    var ptnOpacity = /^d (\d+(?:\.\d+)?)$/;
    var ptnOpacityMap = /^map_d (.+)$/;
    var ptnTransparent = /^Tr (\d+(?:\.\d+)?)$/;
    var ptnTransparentMap = /^map_Tr (.+)$/;

    MtlParser.parse = function(data) {
      this.lines = data.split("\n").map(function(line) {
        return line.trim();
      });
      this.cur = 0;

      return null;
    };

  })();

  if (global["module"]) {
    module.exports = {
      ObjParser: ObjParser,
      MtlParser: MtlParser,
    };
  } else {
    global.globj = {
      ObjParser: ObjParser,
      MtlParser: MtlParser,
    };
  }

})(this);
