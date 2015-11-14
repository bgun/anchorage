import request from 'superagent';
import qs      from 'qs';
import _       from 'lodash';

import settings from '../settings.json';


export default function run(anchor_obj) {

  var params = {
    api_key: settings.FLICKR_API_KEY,
    format: 'json',
    lat: anchor_obj.lat,
    lon: anchor_obj.lon,
    sort: 'interestingness-asc',
    nojsoncallback: 1,
    radius: 1
  };

  var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&"+qs.stringify(params);

  var proxyUrl = settings.PROXY_URL+encodeURIComponent(url);

  return new Promise(function(resolve, reject) {
    request
      .get(proxyUrl)
      .end(function(err, resp) {
        if(err) {
          reject(err);
        } else {
          console.log(resp);
          resolve(resp.body.photos.photo.slice(0,20));
        }
      });
  });
}