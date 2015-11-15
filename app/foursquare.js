import request from 'superagent';
import qs      from 'qs';
import _       from 'lodash';

import settings from '../settings.json';


export default function run(anchor_obj) {

  var fsq_params = {
    client_id: settings.FSQ_CLIENT_ID,
    client_secret: settings.FSQ_CLIENT_SECRET,
    limit: 20,
    m: "foursquare",
    near: anchor_obj.lat+","+anchor_obj.lon,
    radius: 500,
    v: 20140806,
    venuePhotos: 1
  };

  var normalizeFsqRatings = function(arr) {
    console.log(arr);
    var avg = arr.reduce(function(sum, v, index) { return sum+v; }) / arr.length;
    var norm = (avg-5) / (10-5);
    return norm*100;
  };

  var baseUrl = "https://api.foursquare.com/v2/venues/explore?";

  return new Promise(function(outerResolve, outerReject) {

    var sections = [{
      section: 'food',
      handler: function(item) {
        var v = item.venue;
        var photo = v.photos.count ? v.photos.groups[0].items[0] : null;
        return {
          name    : v.name,
          address : v.location ? v.location.formattedAddress.join(', ') : '',
          category: (v.categories && v.categories.length) ? v.categories[0].name : '',
          lat     : v.location.lat,
          lon     : v.location.lng,
          phone   : v.contact ? v.contact.phone : '',
          photo   : photo ? photo.prefix+'300'+photo.suffix : '',
          rating  : v.rating,
          section : 'food'
        }
      }
    }, {
      section: 'sights',
      handler: function(item) {
        var v = item.venue;
        var photo = v.photos.count ? v.photos.groups[0].items[0] : null;
        return {
          name    : v.name,
          address : v.location ? v.location.formattedAddress.join(', ') : '',
          category: (v.categories && v.categories.length) ? v.categories[0].name : '',
          lat     : v.location.lat,
          lon     : v.location.lng,
          phone   : v.contact ? v.contact.phone : '',
          photo   : photo ? photo.prefix+'300'+photo.suffix : '',
          rating  : v.rating,
          section : 'sights'
        }
      }
    }, {
      section: 'outdoors',
      handler: function(item) {
        var v = item.venue;
        var photo = v.photos.count ? v.photos.groups[0].items[0] : null;
        return {
          name    : v.name,
          address : v.location ? v.location.formattedAddress.join(', ') : '',
          category: (v.categories && v.categories.length) ? v.categories[0].name : '',
          lat     : v.location.lat,
          lon     : v.location.lng,
          phone   : v.contact ? v.contact.phone : '',
          photo   : photo ? photo.prefix+'300'+photo.suffix : '',
          rating  : v.rating,
          section : 'outdoors'
        }
      }
    }];

    var promises = sections.map(function(s) {
      return new Promise(function(resolve, reject) {
        var params = _.clone(fsq_params);
        params.section = s.section;
        var url = baseUrl + qs.stringify(params);
        url = settings.PROXY_URL+encodeURIComponent(url);
        console.log(url);
        request
          .get(url)
          .end(function(err, resp) {
            if(err) {
              console.error("SECTION ERROR: ", s.section);
              reject(err);
            }
            let items = resp.body.response.groups[0].items;
            resolve(items.map(s.handler));
          });
      });
    });

    Promise.all(promises)
      .then(function(resolutions) {
        outerResolve({
          venues: resolutions[0].slice(0,10),
          rating_culture : normalizeFsqRatings(_.pluck(resolutions[1], 'rating')),
          rating_food    : normalizeFsqRatings(_.pluck(resolutions[0], 'rating')),
          rating_fun     : normalizeFsqRatings(_.pluck(resolutions[2], 'rating'))
        });
        console.log("RESOLUTIONS", resolutions);
      });
  });

};