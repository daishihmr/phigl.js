var gulp = require("gulp");
var concat = require("gulp-concat");
var sourcemaps = require("gulp-sourcemaps");
var watch = require("gulp-watch");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var fs = require("node-fs-extra");
require("high");
var jsdoc = require("gulp-jsdoc");

var sourceFiles = function(folder) {
  var scan = function(file) {
    var fileList = fs.readdirSync(file);
    return fileList.map(function(child) {
      var stat = fs.statSync(file + "/" + child);
      if (stat.isFile()) {
        return file + "/" + child;
      } else if (stat.isDirectory()) {
        return scan(file + "/" + child);
      }
    });
  };

  var srcs = scan(folder).flatten();

  return srcs;
};

gulp.task("default", ["concat", "uglify", "jsdoc"]);

gulp.task("concat", function() {
  gulp.src(sourceFiles("./src"))
    .pipe(sourcemaps.init())
    .pipe(concat("phigl.js"))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./build"));
});

gulp.task("uglify", function() {
  gulp.src("./build/phigl.js")
    .pipe(uglify())
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(gulp.dest("./build"));
});

gulp.task("jsdoc", function() {
  gulp.src("./src/**/*.js")
    .pipe(jsdoc("./docs"));
});

gulp.task("watch", function() {
  gulp.watch(sourceFiles("./src"), ["concat"]);
});
