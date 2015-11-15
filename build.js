'use strict';

var fs = require("fs");
var browserify = require("browserify");
var less = require('less');


var less_source = fs.readFileSync('./style.less', { encoding: 'utf8' });
console.time("LESS compilation");
less.render(less_source, function (e, output) {
  console.timeEnd("LESS compilation");
  fs.writeFileSync('./content.css', output.css);
});

console.time("Transpiling");
browserify("./index.js")
  .transform("babelify", {presets: ["es2015", "react"]})
  .bundle()
  .pipe(fs.createWriteStream("content.js"));
console.timeEnd("Transpiling");
