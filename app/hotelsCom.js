import request from 'superagent';
import qs      from 'qs';

import settings from '../settings.json';


export default function run() {

  var url = '';
  if (document.location.href.indexOf('hotels.com/ho') > -1) {
    url = "http://localhost:9000/scrape-hcom?url="+encodeURIComponent(document.location);
  } else {
    var query = qs.parse(document.location.search);
    url = "http://localhost:9000/scrape-hcom?url="+encodeURIComponent("http://www.hotels.com/ho" + query['hotel-id']);
  }

  console.log(url);

  return new Promise(function(resolve, reject) {
    request
      .get(url)
      .end(function(err, resp) {
        if(err) reject(err);
        console.log("HOTELS",resp);
        resolve({
          lat: resp.body.lat,
          lon: resp.body.lon
        });
      });
  });
}
