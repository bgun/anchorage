var express = require('express');
var request = require('superagent');
var scraper = require('scraperjs');

var PORT = process.env.port || 9000;

var app = express();
app.use(express.static('public'));

app.use('/', function(req, res) {
  res.send('<h2>hello dencity</h2>');
});

app.use('/proxy', function(req, res) {
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

app.use('/scrape-hcom', function(req, res) {
  console.log("Scraping ", req.url);
  res.header("Access-Control-Allow-Origin", "*");
  scraper.StaticScraper.create(req.query.url)
    .scrape(function($) {
      return $('meta[property="place:location:latitude"],meta[property="place:location:longitude"]').map(function() {
        return $(this).attr('content');
      }).get();
    })
    .then(function(result) {
      console.log("SCRAPED!",result);
      res.send({
        lat: parseFloat(result[0]),
        lon: parseFloat(result[1])
      });
    });
});

app.listen(PORT);
console.log("Server listening on port %d", PORT);