phina.namespace(function() {

  phina.define("phigl.Geometry", {

    positions: null,
    normals: null,
    uvs: null,
    indices: null,

    init: function(options) {},

    setTo: function(drawable) {
      var atributeNames = [];
      var attributeDataArray = [];
      if (this.positions) {
        atributeNames.push("position");
        attributeDataArray.push({ unitSize: 3, data: this.positions });
      }
      if (this.normals) {
        atributeNames.push("normal");
        attributeDataArray.push({ unitSize: 3, data: this.normals });
      }
      if (this.uvs) {
        atributeNames.push("uv");
        attributeDataArray.push({ unitSize: 2, data: this.uvs });
      }

      drawable
        .declareAttributes(atributeNames)
        .setAttributeDataArray(attributeDataArray)
        .setIndexValues(this.indices);

      return this;
    },

  });

  phigl.Drawable.prototype.$method("setGeometry", function(geometry) {
    geometry.setTo(this);
    return this;
  });

});