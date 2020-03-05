const { src, dest, watch } = require("gulp");
const concat = require("gulp-concat");

const defaultTask = () => {
  return src("./src/**/*", { sourcemaps: true })
    .pipe(concat("phigl.js"))
    .pipe(dest("./build/", { sourcemaps: '.' }))
};

exports.default = defaultTask;

watch(["./src/**/*"], defaultTask);
