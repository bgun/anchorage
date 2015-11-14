import request from 'superagent';
import qs      from 'qs';

export default function run() {

  var query = qs.parse(document.location.search);
  var prop_id = query.propID;

  var url = 'http://localhost:9000?url='+encodeURIComponent("https://www.priceline.com/pws/v0/stay/retail/listing/"+prop_id);

  return new Promise(function(resolve, reject) {
    request
      .get(url)
      .end(function(err, resp) {
        if(err) reject(err);
        var hotel = resp.body.hotels[0];
        resolve({
          lat: hotel.location.latitude,
          lon: hotel.location.longitude
        });
      });
  });
}
