'use strict';

import React from 'react';
import StoreDetails from '../common/StoreDetails'
import Request from '../../../../node_modules/superagent/lib/client';
import legacyIESupport from '../../../../node_modules/superagent-legacyiesupport/superagent-legacyIESupport';
import {cursors, shoppingCart} from './../../services/ShoppingCart.js';
import ApiService from '../../services/ApiService';

let apiService = new ApiService();

let SlotReservedDetails = React.createClass({

	arrangeSlotPage: symfonyConfig.symfonyEnvironment + '/arrange-slot',
	homePage: symfonyConfig.symfonyEnvironment + '/',
	checkout : symfonyConfig.symfonyEnvironment + '/basket',

	getInitialState () {
		return{
			hasItems  : false,
			itemTally : 0
		}
	},

	componentDidMount () {

		var itemTally = sessionStorage.getItem('itemTally');

		if (itemTally){
				this.setState({
					hasItems : true,
					itemTally : itemTally
				});
		}
	},

	render () {

        return (

        	<div>
						<div className="collection_slot_reserved_heading_container">
							<img className="green_tick" src="../../../../../compiled/assets/img/icons/green_tick.png" />
							<div className="collection_slot_reserved_heading">
								<h1>
									Collection slot reserved
								</h1>
							</div>
						</div>

						<div className="slot_details_container">

							<div className="slot_details_col">
								<h4>
									Your selected store
								</h4>

								<p className="slot_details_large">
									{this.props.store.name}
								</p>

								<p className="slot_details_address">
									{this.props.store.contact.address1}<br/>
									{this.props.store.contact.address2}<br/>
									{this.props.store.contact.city}, {this.props.store.contact.post_code}
								</p>

								<a className="view_store_details scroll_to_store_details">
									View store details
								</a>
							</div>

							<div className="slot_details_col">
								<h4>
									Your selected date
								</h4>

								<p className="slot_details_large">
									{this.props.slot_date}
								</p>
							</div>

							<div className="slot_details_col">
								<h4>
									Your selected time
								</h4>

								<p className="slot_details_large">
									{this.props.slot_hour}
								</p>
							</div>
						</div>

						<div className="reserved_until_notice_container">
							<img className="info_circle_icon" src="../../../../../compiled/assets/img/icons/info_icon.png" />
							<div className="reserved_until_notice_heading">
								<h3>
									Your slot is reserved until {sessionStorage.getItem('slotExpiryTime')}
								</h3>

								<p className="reserved_until_warning">
									Please check out before this time or you will need to choose another collection slot.
								</p>
							</div>
						</div>


						{this.state.hasItems ?
							<div className="checkout-option">

								<div className="slot_reserved_buttons bordered">
									<a href={this.arrangeSlotPage} className="choose_a_different_slot btn secondary single">
										Choose a different slot
									</a>
								</div>

								<div className="slot_reserved_buttons">

									<a href={this.homePage} className="btn left">
										Continue shopping
									</a>

									<a href={this.checkout} className="continue_shopping btn">
										Checkout
									</a>

								</div>

							</div>
						:
							<div className="slot_reserved_buttons">
								<a href={this.arrangeSlotPage} className="choose_a_different_slot btn secondary">
									Choose a different slot
								</a>

								<a href={this.homePage} className="continue_shopping btn">
									Continue shopping
								</a>
							</div>
						}

        	</div>
        );
    }
});

let SlotReservedConfirmation = React.createClass({

	arrangeSlotPage: symfonyConfig.symfonyEnvironment + '/arrange-slot',

	componentDidMount () {

		if (sessionStorage.getItem('sbXmasBasketId')){

			cursors.slot.on('update', () => {

				var slot = shoppingCart.getSlot();

		   		if (slot.id){

                    apiService.getStoreDetails(slot.store_code).end(function(err, res){

						   		if (res.ok) {

						   			// set store Name for mobile
						   			document.getElementById('mobile_store_name').innerHTML = res.body.name;

			    					// display 'slot_date' in correct format then send to SlotReservedDetails as prop
									let date_time_regex = /(\d{4})-(\d{2})-(\d{2})/g;
									let matches = date_time_regex.exec(this.slot_date);
			    					let slot_date_obj = new Date(matches[1],matches[2]-1,matches[3]);
			    					let days = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];
			    					let slot_date = days[slot_date_obj.getDay()] + ' ' + slot_date_obj.getDate() + ' Dec';

			    					// display 'slot_hour' in correct format then send to SlotReservedDetails as prop
			    					let slot_hour = this.slot_hour + ':00 - ' + (this.slot_hour + 2) + ':00';

			    					React.render(<SlotReservedDetails slot_date={slot_date} slot_hour={slot_hour} store={res.body} />, document.getElementById('slot_reserved_details'));

			    					// show store's details
		   							React.render(<StoreDetails store_code={this.store_code} />, document.getElementById('store_details_placeholder'));

		   							// Analytics
						            digitalData.event.push({'eventInfo':{
										'eventName': 'collectionConfirmed',
										'storeSelected' : this.store_code, //store id selected
										'deliverySlot' : slot_date + ' ' + slot_hour //delivery slot selected, format hh:mm-hh:mm|dd/mm/yy
									}});

								} else {

									console.log('Oh no! error ' + res.text);
								}
						   	}.bind(slot));

				}

			});

            // if no slot attached to basket, redirect to /arrange-slot page
            setTimeout(function(){

                var slot = shoppingCart.getSlot();

                if (!slot.id){

                    window.location = this.arrangeSlotPage;
                }
            }.bind(this), 5000);

		} else {

			// no basket, redirect to /arrange-slot
			window.location = this.arrangeSlotPage;
		}
    },

    showMobileCollectionSlots () {

    	// activate collection slots panel
    	document.querySelector('#slot_reserved_details').style.display = "block";
    	React.findDOMNode(this.refs.mobileCollectionSlotTab).className = "mobile_tab_menu active";

    	// deactivate store details panel
    	document.querySelector('.store_details_container').style.display = "none";
    	React.findDOMNode(this.refs.mobileStoreDetailsTab).className = "mobile_tab_menu";
    },

    showMobileStoreDetails () {

    	// activate store details panel
    	document.querySelector('.store_details_container').style.display = "block";
    	React.findDOMNode(this.refs.mobileStoreDetailsTab).className = "mobile_tab_menu active";

    	// deactivate collection slots panel
    	document.querySelector('#slot_reserved_details').style.display = "none";
    	React.findDOMNode(this.refs.mobileCollectionSlotTab).className = "mobile_tab_menu";
    },

	render () {
        return (
        	<div>

        		<h2 id="mobile_store_name" className="mobile_store_name"></h2>

        		<div className="mobile_tab_menu_container">
		            <a className="mobile_tab_menu active" onClick={this.showMobileCollectionSlots} ref="mobileCollectionSlotTab">
		                Collection Slots
		            </a>
		            <a className="mobile_tab_menu" onClick={this.showMobileStoreDetails} ref="mobileStoreDetailsTab">
		                Store Details
		            </a>
		        </div>


						<div id="slot_reserved_details"></div>

						<div className="collection_slot_store_details">
        			<div id="store_details_placeholder"></div>
    				</div>

					</div>
        );
    }
});

export default SlotReservedConfirmation;
