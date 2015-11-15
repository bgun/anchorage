'use strict';

import React    from 'react';
import ReactDOM from 'react-dom';
import $        from 'jquery';

import flickr     from './app/flickr.js';
import foursquare from './app/foursquare.js';

import priceline  from './app/priceline.js';
import hotelsCom  from './app/hotelsCom.js';


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
      show: false,
      photos: [],
      venues: []
    }
  }

  getData(anchor_obj) {
    let t = this;

    console.log("got data", anchor_obj);

    t.setState({
      show: true
    });

    // get venues
    foursquare(anchor_obj)
      .then(function(data) {
        t.setState({
          venues: data.venues
        })
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

  render() {
    let venues = this.state.venues.map((v, i) => <VenueListItem venue={ v } key={ 'venue-'+i } />);
    let photos = this.state.photos.map((p, i) => <PhotoListItem photo={ p } key={ 'photo-'+i } />);

    return (
      <div id="anchorage-main" className={ this.state.show ? 'show' : '' }>
        <header></header>
        <ul className="venue-list">
          { venues }
        </ul>
        <ul className="photo-list">
          { photos }
        </ul>
      </div>
    );
  }
}


let main = document.createElement('div');
main.id = "anchorage-container";
document.body.appendChild(main);
ReactDOM.render(React.createElement(Anchorage, {}), main);