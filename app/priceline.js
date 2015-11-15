import request from 'superagent';
import qs      from 'qs';

import settings from '../settings.json';


export default function run() {

  var query = qs.parse(document.location.search);
  var prop_id = query.propID;

  var url = settings.PROXY_URL+encodeURIComponent("https://www.priceline.com/pws/v0/stay/retail/listing/"+prop_id);

  return new Promise(function(resolve, reject) {
    request
      .get(url)
      .end(function(err, resp) {
        if(err) reject(err);
        var hotel = resp.body.hotels[0];
        console.log("HOTEL",hotel);
        resolve({
          lat: hotel.location.latitude,
          lon: hotel.location.longitude
        });
      });
  });
}
