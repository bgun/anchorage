import request from 'superagent';
import qs      from 'qs';
import _       from 'lodash';

import settings from '../settings.json';


export default function run() {

  var query = qs.parse(document.location.search);
  var prop_id = query.propID;
  if (_.isArray(prop_id)) {
    prop_id = prop_id[0];
  }

  var url = settings.PROXY_URL+encodeURIComponent("https://www.priceline.com/pws/v0/stay/retail/listing/detail/"+prop_id);

  return new Promise(function(resolve, reject) {
    request
      .get(url)
      .end(function(err, resp) {
        if(err) reject(err);
        var hotel = resp.body.hotel;
        console.log("HOTEL",hotel);
        resolve({
          rating_safety   : hotel.ratings[1].score,
          rating_transport: hotel.ratings[2].score,
          lat: hotel.location.latitude,
          lon: hotel.location.longitude
        });
      });
  });
}