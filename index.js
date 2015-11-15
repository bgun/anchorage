'use strict';

import React    from 'react';
import ReactDOM from 'react-dom';
import _        from 'lodash';
import mapbox   from 'mapbox.js';

import flickr     from './app/flickr.js';
import foursquare from './app/foursquare.js';

import priceline  from './app/priceline.js';
import hotelsCom  from './app/hotelsCom.js';

import settings   from './settings.json';


class VenueListItem extends React.Component {
  render() {
    let v = this.props.venue;
    return (
      <li className="venue">
        <img src={ v.photo } />
        <h2><a href="">{ v.name }</a></h2>
        <address>{ v.address }</address>
        <div>{ v.category }</div>
      </li>
    );
  }
}

class PhotoListItem extends React.Component {
  render() {
    let p = this.props.photo;
    let url = 'https://farm'+p.farm+'.staticflickr.com/'+p.server+'/'+p.id+'_'+p.secret+'_q.jpg';
    return (
      <li className="photo">
        <img src={ url } />
      </li>
    );
  }
}

class Anchorage extends React.Component {

  constructor() {
    super();
    this.state = {
      activeTab: 0,
      map: null,
      photos: [],
      rating_culture   : 0,//Math.random()*100,
      rating_food      : 0,//Math.random()*100,
      rating_fun       : 0,//Math.random()*100,
      rating_safety    : 0,//Math.random()*100,
      rating_transport : 0,//Math.random()*100,
      show: false,
      venues: []
    }
  }

  getData(anchor_obj) {
    let t = this;

    console.log("got data", anchor_obj);

    L.mapbox.accessToken = settings.MAPBOX_TOKEN;
    let map = L.mapbox.map('mapbox-map', settings.MAPBOX_ID, {
      attributionControl: false,
      scrollWheelZoom: false
    });
    let venueIcon = L.mapbox.marker.icon({ 'marker-color': '#1133FF', 'marker-symbol': 'restaurant' });
    let hotelIcon = L.mapbox.marker.icon({ 'marker-color': '#F96332', 'marker-symbol': 'circle' });

    var hotelMarker = L.marker([anchor_obj.lat, anchor_obj.lon], { icon: hotelIcon }).addTo(map);
    map.setView([anchor_obj.lat, anchor_obj.lon], 15);

    // get venues
    foursquare(anchor_obj)
      .then(function(data) {
        t.setState({
          venues: data.venues,
          rating_culture: data.rating_culture,
          rating_food   : data.rating_food,
          rating_fun    : data.rating_fun
        });

        // add markers to map
        data.venues.forEach(function(v) {
          console.log(v);
          let marker = L.marker([v.lat, v.lon], { icon: venueIcon }).addTo(map);
        });
      })
      .catch(function(err) {
        console.error("Foursquare data error", err);
      });

    // get photos
    flickr(anchor_obj)
      .then(function(photos) {
        t.setState({
          photos: photos
        })
      })
      .catch(function(err) {
        console.error("Flickr data error", err);
      });

    t.setState({
      show: true,
      rating_transport: anchor_obj.rating_transport * 10,
      rating_safety   : anchor_obj.rating_safety    * 10,
      lat: anchor_obj.lat,
      lon: anchor_obj.lon,
      map: map
    });
  }

  componentDidMount() {
    var t = this;

    switch(document.location.hostname) {
      case 'www.priceline.com':
        priceline()
          .then(t.getData.bind(t));
        break;
      case 'www.hotels.com':
        hotelsCom()
          .then(t.getData.bind(t));
        break;
    }
  }

  toggle() {
    this.setState({
      show: !this.state.show
    });
  }

  setActiveTab(index) {
    this.setState({
      activeTab: index
    });
  }

  getRatingClass(r) {
    if (r > 85) {
      return 'vgood';
    } else if(r > 70) {
      return 'good';
    } else if (r > 50) {
      return 'moderate';
    } else {
      return 'poor';
    }
  }

  render() {
    let t = this;
    let venues = this.state.venues.map((v, i) => <VenueListItem venue={ v } key={ 'venue-'+i } />);
    let photos = this.state.photos.map((p, i) => <PhotoListItem photo={ p } key={ 'photo-'+i } />);

    let tabs = [{
      title: 'Nearby',
      content: (
        <div className="tab">
          <div id="map"></div>
          <ul className="venue-list">{ venues }</ul>
        </div>
      )
    }, {
      title: 'Photos',
      content: (
        <div className="tab">
          <ul className="photo-list">{ photos }</ul>
        </div>
      )
    }];
    let tabContent = tabs[t.state.activeTab].content;
    let tabHandles = tabs.map(function(tab, index) {
      return (
        <li className={ "tab "+(t.state.activeTab === index ? 'selected' : '') } onClick={ t.setActiveTab.bind(t, index) }>{ tab.title }</li>
      );
    });

    // refresh map
    if (t.state.map) {
      console.log("invalidating map");
      setTimeout(function() {
        t.state.map.invalidateSize();
      }, 1000)
    }

    let rating_total = 0;
    [t.state.rating_culture, t.state.rating_food, t.state.rating_fun, t.state.rating_safety, t.state.rating_transport].forEach(function(r) {
      rating_total += r;
    });
    let rating_overall = rating_total/5;

    return (
      <div>
        <div id="anchorage-toggle" onClick={ t.toggle.bind(t) } className={ t.state.show ? 'right' : 'left' }></div>
        <div id="anchorage-main" className={ t.state.show ? 'show' : '' }>
          <header></header>
          <h2 className="title">Neighborhood Scores</h2>
          <ul className="ratings">
            <li className="rating"><div className="title">Overall  </div><div className="track"><div className={ 'bar '+(t.getRatingClass(        rating_overall  )) } style={{ width: rating_overall          +'%'}}></div></div></li>
            <li className="rating"><div className="title">Culture  </div><div className="track"><div className={ 'bar '+(t.getRatingClass(t.state.rating_culture  )) } style={{ width: t.state.rating_culture  +'%'}}></div></div></li>
            <li className="rating"><div className="title">Food     </div><div className="track"><div className={ 'bar '+(t.getRatingClass(t.state.rating_food     )) } style={{ width: t.state.rating_food     +'%'}}></div></div></li>
            <li className="rating"><div className="title">Fun      </div><div className="track"><div className={ 'bar '+(t.getRatingClass(t.state.rating_fun      )) } style={{ width: t.state.rating_fun      +'%'}}></div></div></li>
            <li className="rating"><div className="title">Safety   </div><div className="track"><div className={ 'bar '+(t.getRatingClass(t.state.rating_safety   )) } style={{ width: t.state.rating_safety   +'%'}}></div></div></li>
            <li className="rating"><div className="title">Transport</div><div className="track"><div className={ 'bar '+(t.getRatingClass(t.state.rating_transport)) } style={{ width: t.state.rating_transport+'%'}}></div></div></li>
          </ul>
          <ul className="tabs">{ tabHandles }</ul>
          <div id="mapbox-map" className={ t.state.activeTab === 0 ? 'show' : '' }></div>
          { tabContent }
        </div>
      </div>
    );
  }
}


let main = document.createElement('div');
main.id = "anchorage-container";
document.body.appendChild(main);

let mapbox_css = document.createElement('link');
mapbox_css.href = 'https://api.mapbox.com/mapbox.js/v2.2.3/mapbox.css';
mapbox_css.rel = 'stylesheet';
document.getElementsByTagName('head')[0].appendChild(mapbox_css);

ReactDOM.render(React.createElement(Anchorage, {}), main);