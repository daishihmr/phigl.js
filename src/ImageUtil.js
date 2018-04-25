phina.namespace(function() {

  /**
   * @constructor phigl.ImageUtil
   */
  phina.define("phigl.ImageUtil", {

    init: function() {},

    _static: {

      calcSizePowOf2: function(origWidth, origHeight) {
        var asp = origWidth / origHeight;

        var width = Math.pow(2, Math.ceil(Math.log2(origWidth)));
        var height = Math.pow(2, Math.ceil(Math.log2(origHeight)));

        var fitW = asp > width / height;

        if (fitW) {
          var h = width / asp;
          return {
            srcX: 0,
            srcY: (height - h) * 0.5,
            srcWidth: width,
            srcHeight: h,
            width: width,
            height: height,
          };
        } else {
          var w = height * asp;
          return {
            srcX: (width - w) * 0.5,
            srcY: 0,
            srcWidth: w,
            srcHeight: height,
            width: width,
            height: height,
          };
        }
      },

      /**
       * @memberOf phigl.ImageUtil
       */
      resizePowOf2: function(options) {
        options = ({}).$safe(options, {
          dst: null,
        });

        var src = options.src;
        var dst = options.dst || phina.graphics.Canvas();
        var fitW = src.width < src.height;
        var asp = src.width / src.height;

        if (typeof(src) == "string") {
          src = phina.asset.AssetManager.get("image", src);
        }

        if (Math.sqrt(src.domElement.width) % 1 === 0 && Math.sqrt(src.domElement.height) % 1 === 0) {
          return src;
        }

        dst.clear();

        var width = Math.pow(2, Math.ceil(Math.log2(src.domElement.width)));
        var height = Math.pow(2, Math.ceil(Math.log2(src.domElement.height)));
        dst.domElement.width = width;
        dst.domElement.height = height;

        if (fitW) {
          var h = width / asp;
          dst.context.drawImage(src.domElement,
            0, 0, src.domElement.width, src.domElement.height,
            0, (height - h) * 0.5, width, h
          );
        } else {
          var w = height * asp;
          dst.context.drawImage(src.domElement,
            0, 0, src.domElement.width, src.domElement.height,
            (width - w) * 0.5, 0, w, height
          );
        }

        return dst;
      },

    },

  });
});
