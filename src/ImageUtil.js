phina.namespace(function() {

  /**
   * @constructor phigl.ImageUtil
   */
  phina.define("phigl.ImageUtil", {

    init: function() {},

    _static: {

      /**
       * @memberOf phigl.ImageUtil
       */
      resizePowOf2: function(image, fitH, fitV) {
        if (typeof(image) == "string") {
          image = phina.asset.AssetManager.get("image", image).domElement;
        }

        if (Math.sqrt(image.width) % 1 == 0 && Math.sqrt(image.height) % 1 == 0) {
          return image;
        }

        var width = Math.pow(2, Math.ceil(Math.log2(image.width)));
        var height = Math.pow(2, Math.ceil(Math.log2(image.height)));

        var canvas = phina.graphics.Canvas().setSize(width, height);

        var dw = fitH ? width : image.width;
        var dh = fitV ? height : image.height;

        canvas.context.drawImage(image,
          0, 0, image.width, image.height,
          0, 0, dw, dh
        );

        return canvas;
      },

    },

  });
});
