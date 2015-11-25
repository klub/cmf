'use strict';

import React from 'react';
import ApiService from './../../services/ApiService.js';
import {cursors, shoppingCart} from './../../services/ShoppingCart.js';

var apiService = new ApiService();

let SlotSearchBox = React.createClass({

	getInitialState (){

		// detect IE9
		var isIe9 = false;

		if(navigator.appVersion.indexOf("MSIE 9") > -1){
				isIe9 = true;
		}

		//Placeholder text
		var placeholder = "E.g. HN01 5HT";

		if (window.innerWidth >= 980) {
			 placeholder = 'Enter postcode or town';
		}

		return {
			isIe9 : isIe9,
			showLabel :true,
			placeholder : placeholder
		}
	},

	searchButton () {

		// run search if user entered something
		if (React.findDOMNode(this.refs.searchBoxInput).value != "") {
			// get stores from API
			this.props.getStoresFromAPI(React.findDOMNode(this.refs.searchBoxInput).value);

			// reduce height of search box section
			document.querySelector('.slot_margins').style.padding='20px 0';
			document.querySelector('.slot_banner').style.height='170px';

			// hide previous results' slot matrix and store details
			document.getElementById('slot_matrix_placeholder').style.display='none';
			document.getElementById('store_details_placeholder').style.display='none';

			// remove "active" class from any previous search results
			for(var i = 0; i < document.getElementsByClassName('info_container').length; i++) {
			   document.getElementsByClassName('info_container')[i].className = 'info_container';
			}
			for(var i = 0; i < document.getElementsByClassName('address_full').length; i++) {
			   document.getElementsByClassName('address_full')[i].style.display="none";
			}
			for(var i = 0; i < document.getElementsByClassName('view_store_details').length; i++) {
			   document.getElementsByClassName('view_store_details')[i].style.display="none";
			}

			this.setState({
				showLabel :false
			});

			// Analytics

			digitalData.event.push({'eventInfo':{
				'eventName': 'collectionSearch',
				'collectionPostCode' : React.findDOMNode(this.refs.searchBoxInput).value, //postcode searched
			}});
		}
    },

    clearSearchBoxInput () {

    	React.findDOMNode(this.refs.searchBoxInput).value = "";
    	React.findDOMNode(this.refs.clearSearchBoxInput).style.display="none";
    },

    SearchBoxKeyUp (e) {

    	// if search textbox has value, add "X" to end of textbox (clicking "X" then deletes value in search textbox)
    	if (React.findDOMNode(this.refs.searchBoxInput).value.length > 0){

    		React.findDOMNode(this.refs.clearSearchBoxInput).style.display="block";
    	} else {

    		React.findDOMNode(this.refs.clearSearchBoxInput).style.display="none";
    	}
    },

	componentDidMount () {

		var autoComplete = new google.maps.places.Autocomplete(
				(document.getElementById('searchBoxInput')),
				{types: ['geocode']});

		autoComplete.addListener('place_changed', this.searchButton);

		// if slot exists, start slot autopopulate
		cursors.slot.on('update', () => {

			var slot = shoppingCart.getSlot();

			apiService.getStoreDetails(slot.store_code).end(function(err, res){

	            if (res.ok) {

	                document.getElementById('searchBoxInput').value=res.body.contact.post_code;
	                document.getElementById('find_stores').click();

	            } else {
	                console.log('Oh no! error ' + res.text);
	            }
	        });

		});
	},

    render () {
        return (
            <div className="slot_banner">
			    <div className="slot_margins inner-container">

			    	<div className="slot_header">
				        <h1>
				        	Select a collection slot
				        </h1>

				        <h2>
				        	Find a participating store to book your collection slot below
				        </h2>
			        </div>

			        <div className="slot_search_container">
								{this.state.isIe9 && this.state.showLabel ? <label className="ie9label">{this.state.placeholder}</label> : ''}
			        	<div className="slot_search_input_container">
			        		<input id="searchBoxInput" onKeyUp={this.SearchBoxKeyUp} ref="searchBoxInput" type="text" placeholder={this.state.placeholder}/>

			        		<img className="clear_search_box" ref="clearSearchBoxInput" onClick={this.clearSearchBoxInput} src="../../../../../compiled/assets/img/icons/x_icon.png" />
			        	</div>

			        	<button id="find_stores" onClick={this.searchButton} className="slot_search_button btn">
			        		Find stores
			        	</button>
			        </div>
			    </div>
			</div>
        );
    }
});

export default SlotSearchBox;
