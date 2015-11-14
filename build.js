'use strict';

var fs = require("fs");
var browserify = require("browserify");

browserify("./index.js")
  .transform("babelify", {presets: ["es2015", "react"]})
  .bundle()
  .pipe(fs.createWriteStream("content.js"));