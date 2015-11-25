'use strict';

import React from 'react';
import SlotMatrix from './SlotMatrix'
import StoreDetails from '../common/StoreDetails'
import {cursors, shoppingCart} from './../../services/ShoppingCart.js';

let ListItemWrapper = React.createClass({

	focusOnThisStore (event) {

		// check if user already has slot
		var slot = shoppingCart.getSlot();

		if (React.findDOMNode(this).className === 'info_container'){
	        // show store's available slots
	        this.props.getCurrentStoreSlots(this.props.data.code, this.props.data.name);
	        document.getElementById('slot_matrix_placeholder').style.display='block';

	        // show store's details
	        React.render(<StoreDetails store_code={this.props.data.code} />, document.getElementById('store_details_placeholder'));
	        document.getElementById('store_details_placeholder').style.display='block';

	        // hide store details if on mobile
	        if (window.innerWidth < 980 && document.querySelector('.store_details_container')){
	        	document.querySelector('.store_details_container').style.display='none';
	        } else if (window.innerWidth >= 980 && slot.id === undefined){
	        	window.scrollTo(0,175);
	        }

	        // Analytics

	        digitalData.event.push({'eventInfo':{
				'eventName': 'storeSelected',
				'storeId' : this.props.data.code //store id selected
			}});
		}

  		// clear focus on all stores
		for(var i = 0; i < document.getElementsByClassName('info_container').length; i++) {
		   document.getElementsByClassName('info_container')[i].className = 'info_container';
		}
		for(var i = 0; i < document.getElementsByClassName('address_full').length; i++) {
		   document.getElementsByClassName('address_full')[i].style.display="none";
		}
		for(var i = 0; i < document.getElementsByClassName('view_store_details').length; i++) {
		   document.getElementsByClassName('view_store_details')[i].style.display="none";
		}

		// focus on clicked on store
        React.findDOMNode(this).className = 'info_container active';
        React.findDOMNode(this).querySelector('.address_full').style.display="block";
        React.findDOMNode(this).querySelector('.view_store_details').style.display="block";


	},

	focusFirstSlot (){

		if (document.querySelector('.time_slot') != null){

			var focusSlot = document.querySelector('.time_slot');
			focusSlot.focus();
		}

		var headerHeight = document.querySelector('.header').offsetHeight;
		window.scrollTo(0, document.getElementById('slot_matrix_placeholder').getBoundingClientRect().top + window.pageYOffset - headerHeight);
	},

	componentDidMount (){

		// auto select store if slot found in baobab
		if (document.getElementById('marker_5')){
			var slot = shoppingCart.getSlot();
			if (slot.id && document.querySelector('[id="marker_1"][data-store-id="' + slot.store_code + '"]')){
				document.querySelector('[id="marker_1"][data-store-id="' + slot.store_code + '"]').click();
			}
		}
	},

  	render () {

		return (
			<div id={'marker_' + (this.props.loop_no + 1)} className="info_container" data-store-id={this.props.data.code} onClick={this.focusOnThisStore}>
				<div className="markers_container">
			        <div className="small_marker">
				        {this.props.loop_no + 1}
			        </div>
				</div>

				<div className="address_container">
					<h3 className="address_name">
						{this.props.data.name}
					</h3>

					<p className="address_full">
						{this.props.data.contact.address1}<br/>
						{this.props.data.contact.address2}<br/>
						{this.props.data.contact.city}, {this.props.data.contact.post_code}
					</p>

			        <a  className="view_store_details scroll_to_store_details">
 			            View store details
 			        </a>
				</div>

				<p className="distance_container">
					{!isNaN(Math.round(this.props.data.distance * 10) / 10) ? Math.round(this.props.data.distance * 10) / 10 + ((Math.round(this.props.data.distance * 10) / 10) === 1 ? ' mile' : ' miles') : '' }
				</p>

			    <button className="select_collection_slot btn"  onClick={this.focusFirstSlot} onFocus={this.focusOnThisStore}>
			        Select a collection slot
			    </button>
			</div>
		);
	}
});

let NearestStores = React.createClass({

    componentWillReceiveProps (nextProps) {

        if (nextProps.state.showMap){

        	// google map
	    	window.initialize = function() {

				var mapOptions = {
					panControl: false,
					zoomControl: true,
					mapTypeControl: false,
					scaleControl: false,
					streetViewControl: false,
					overviewMapControl: false
				};

				var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

				var bounds = new google.maps.LatLngBounds();

				for (var i = 0; i < nextProps.state.stores.length; i++) {

					var icon_obj = {
						url:'../../../compiled/assets/img/book-a-slot/small_pin_' + (i + 1) + '.png'
					};

					var marker1 = new google.maps.Marker({
						position: new google.maps.LatLng(nextProps.state.stores[i].location.lat, nextProps.state.stores[i].location.lng),
						map: map,
						icon: icon_obj
					});

					marker1.addListener('click', function(index){

						return function() {

							document.getElementById('marker_' + (index + 1)).click();
						}

					}(i));

					bounds.extend(new google.maps.LatLng(nextProps.state.stores[i].location.lat, nextProps.state.stores[i].location.lng));
				}

				map.fitBounds(bounds);

				var styleArray = [
					{
					featureType: "poi.business",
					elementType: "labels",
					stylers: [
							{ visibility: "off" }
						]
					}
				];
				map.setOptions({styles: styleArray});

			}

			function loadScript() {
			  var script = document.createElement('script');
			  script.type = 'text/javascript';
			  script.id = 'google_maps_script';
			  script.src = 'https://maps.googleapis.com/maps/api/js?client=gme-jsinfo&v=3.21&signed_in=false&callback=initialize&channel=xmas2015';
			  document.body.appendChild(script);
			}

			if (document.getElementById('google_maps_script')) {

				initialize();
			} else {

				loadScript();
			}
        }
    },



	render () {

		return (

			<div className="nearest_stores">
				<div className="inner-container nearest_stores_slot_margins">

					<div className="nearest_store_info_message">
						<h2>
							Sorry, your search returned no results...
						</h2>
					</div>

					<div className="nearest_stores_results">
						<h2>
							Your nearest stores
						</h2>

						<div id="map-canvas" className="map"></div>
						<div className="store_list">
							{this.props.state.stores.map(function(result, i) {
							   return <ListItemWrapper key={result.code} data={result} loop_no={i} focusFirstSlot={this.focusFirstSlot} getCurrentStoreSlots={this.getCurrentStoreSlots} />;
							}, this.props)}
						</div>
					</div>
				</div>
			</div>
		);
	}
});

export default NearestStores;
