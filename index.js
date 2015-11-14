'use strict';

import React    from 'react';
import ReactDOM from 'react-dom';
import $        from 'jquery';

import flickr     from './app/flickr.js';
import foursquare from './app/foursquare.js';
import priceline  from './app/priceline.js';


class VenueListItem extends React.Component {
  render() {
    return (
      <li className="venue">
        <h2>{ this.props.venue.name }</h2>
        <address>{ this.props.venue.address }</address>
        <div>{ this.props.venue.category }</div>
      </li>
    );
  }
}

class PhotoListItem extends React.Component {
  render() {

    var p = this.props.photo;
    var url = 'https://farm'+p.farm+'.staticflickr.com/'+p.server+'/'+p.id+'_'+p.secret+'_q.jpg';

    return (
      <li className="photo"><img src={ url } /></li>
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

  componentDidMount() {
    let t = this;
    switch(document.location.hostname) {
      case 'www.priceline.com':
        priceline()
          .then(function(anchor_obj) {

            t.setState({
              show: true
            });

            // get venues
            foursquare(anchor_obj)
              .then(function(venues) {
                t.setState({
                  venues: venues
                })
              });

            // get photos
            flickr(anchor_obj)
              .then(function(photos) {
                t.setState({
                  photos: photos
                })
              });
          })
          .catch(function() {

          });
        break;
    }
  }

  render() {
    let venues = this.state.venues.map(v => <VenueListItem venue={ v } />);
    let photos = this.state.photos.map(p => <PhotoListItem photo={ p } />);

    return (
      <div id="anchorage-main" className={ this.state.show ? 'show' : '' }>
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