var BANNER = [
  "/*",
  " * phigl.js <%= pkg.version %>",
  " * <%= pkg.homepage %>",
  " * ",
  " * The MIT License (MIT)",
  " * Copyright © 2016-2017 <%= pkg.author %>",
  " * ",
  " * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and",
  " * associated documentation files (the “Software”), to deal in the Software without restriction, including",
  " * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies",
  " * of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following",
  " * conditions:",
  " * ",
  " * The above copyright notice and this permission notice shall be included in all copies or substantial portions",
  " * of the Software.",
  " * ",
  " * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR",
  " * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,",
  " * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE",
  " * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER",
  " * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,",
  " * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN",
  " * THE SOFTWARE.",
  " */",
  "",
].join("\n");

var pkg = require("./package.json");
var gulp = require("gulp");
var banner = require("gulp-banner");
var concat = require("gulp-concat");
var sourcemaps = require("gulp-sourcemaps");
var watch = require("gulp-watch");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var fs = require("node-fs-extra");
require("high");
var jsdoc = require("gulp-jsdoc3");

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

gulp.task("default", ["concat", "uglify"]);

gulp.task("concat", function() {
  gulp.src(sourceFiles("./src"))
    .pipe(banner(BANNER, { pkg: pkg }))
    .pipe(sourcemaps.init())
    .pipe(concat("phigl.js"))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./build"));
});

gulp.task("uglify", function() {
  gulp.src("./build/phigl.js")
    .pipe(uglify())
    .pipe(banner(BANNER, { pkg: pkg }))
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(gulp.dest("./build"));
});

gulp.task("jsdoc", function() {
  var config = require("./jsdoc.json");
  gulp.src(["README.md", "./src/**/*.js"], { read: false })
    .pipe(jsdoc(config));
});

gulp.task("watch", function() {
  gulp.watch(sourceFiles("./src"), ["concat"]);
});

gulp.task("watchJsdoc", function() {
  gulp.watch(sourceFiles("./src"), ["jsdoc"]);
});
