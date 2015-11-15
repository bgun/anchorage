import request from 'superagent';
import qs      from 'qs';
import _       from 'lodash';

import settings from '../settings.json';


export default function run(anchor_obj) {

  var params = {
    client_id: settings.FSQ_CLIENT_ID,
    client_secret: settings.FSQ_CLIENT_SECRET,
    limit: 20,
    m: "foursquare",
    near: anchor_obj.lat+","+anchor_obj.lon,
    radius: 500,
    section: 'food',
    v: 20140806,
    venuePhotos: 1
  };

  var baseUrl = "https://api.foursquare.com/v2/venues/explore?";
  var url = baseUrl + qs.stringify(params);
  url = settings.PROXY_URL+encodeURIComponent(url);

  return new Promise(function(resolve, reject) {
    console.log("foursquare",url);
    request
      .get(url)
      .end(function(err, resp) {
        if(err) reject(err);
        let items = resp.body.response.groups[0].items;
        resolve(items.map(function(i) {
          var v = i.venue;
          console.log(v);
          var photo = v.photos.count ? v.photos.groups[0].items[0] : null;
          return {
            name    : v.name,
            phone   : v.contact ? v.contact.phone : '',
            address : v.location ? v.location.formattedAddress.join(', ') : '',
            category: (v.categories && v.categories.length) ? v.categories[0].name : '',
            photo   : photo ? photo.prefix+'300'+photo.suffix : ''
          }
        }));
      });
  });

};