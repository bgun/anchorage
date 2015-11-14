import request from 'superagent';
import qs      from 'qs';
import _       from 'lodash';

export default function run(anchor_obj) {

  console.log("FOURSQUARE ANCHOR", anchor_obj);

  var categories = [
    '4d4b7105d754a06374d81259', // Food
    '4bf58dd8d48988d1e0931735', // Coffee Shop
    '4bf58dd8d48988d103951735'  // Clothing Store
  ].join(',');

  var baseUrl = "https://api.foursquare.com/v2/venues/search?";
  var proxyUrl = "http://localhost:9000?url=";
  var params = {
    ll: anchor_obj.lat+","+anchor_obj.lon,
    categoryId: categories,
    intent: 'browse',
    radius: 1500,
    limit: 50,
    v: 20140806,
    m: "foursquare",
    client_id: "HEJVAAIGR31R5JB3IZDFQVWDOCGAXOIZB5NGJHIOEADKYGZF",
    client_secret: "AN0M1JJ23ZXVW02KMMGSXXJETQ5JCWLAWEOEFCMM1SX0PEGD"
  };

  return new Promise(function(resolve, reject) {
    var url = baseUrl + qs.stringify(params);
    url = proxyUrl + encodeURIComponent(url);
    console.log(url);
    request
      .get(url)
      .end(function(err, resp) {
        if(err) reject(err);
        let venues = resp.body.response.venues;
        resolve(venues.map(function(v) {
          return {
            name: v.name,
            address: v.location ? v.location.address : '',
            category: (v.categories && v.categories.length) ? v.categories[0].name : ''
          }
        }));
      });
  });

};