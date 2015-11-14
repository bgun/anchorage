var express = require('express');
var request = require('superagent');

var PORT = process.env.port || 9000;

var app = express();
app.use('/', function(req, res) {
  var url = decodeURIComponent(req.query.url);
  console.log("URL:",url);
  res.header("Access-Control-Allow-Origin", "*");
  request
    .get(url)
    .end(function(err, resp) {
      if(err) {
        console.error(err);
      } else {
        console.log("success");
        res.send(resp.body);
      }
    });
});

app.listen(PORT);
console.log("Server listening on port %d", PORT);