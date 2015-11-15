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
  var hasRating = function(obj) {
    return obj.rating ? true : false;
  }

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
      section: 'art',
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
          section : 'art'
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
      section: 'drinks',
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
          venues: [].concat(
            resolutions[0].slice(0,2),
            resolutions[1].slice(0,2),
            resolutions[2].slice(0,2),
            resolutions[3].slice(0,2)
          ),
          rating_food    : normalizeFsqRatings(_(resolutions[0]).filter(hasRating).pluck('rating').value()),
          rating_culture : normalizeFsqRatings(_(resolutions[1]).filter(hasRating).pluck('rating').value()),
          rating_fun     : normalizeFsqRatings(_(resolutions[2].concat(resolutions[3])).filter(hasRating).pluck('rating').value())
        });
        console.log("RESOLUTIONS", resolutions);
      });
  });

};