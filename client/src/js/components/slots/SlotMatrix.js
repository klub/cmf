'use strict';

import React from 'react';
import {cursors, shoppingCart} from './../../services/ShoppingCart.js';
import ApiService from '../../services/ApiService';

let apiService = new ApiService();

let Slots = React.createClass({

	getInitialState () {
		return {
			selected : false
		};
	},

	render () {

		let output = '';

		for (var key in this.props.data) {

			if (this.props.data.hasOwnProperty(key)) {
				if (this.props.data[key]){
					output += '<a href="#" class="time_slot" data-date="' + this.props.date + '" data-store="' + this.props.store + '" data-time-slot="' + key + '">' + key + '</a>';
				} else {
					output += '<a href="#" class="time_slot disabled" data-date="' + this.props.date + '" data-store="' + this.props.store + '" data-time-slot="' + key + '">' + key + '</a>';
				}
			}
		}

        return <div dangerouslySetInnerHTML={{__html: output}}></div>;
    }

});

let SlotMatrix = React.createClass({

	slotsAvailable : false,
	selectedTime : '',
	selectedStore : '',

	storeSlotAvailabilityCheck (currentStoreSlots) {

		// check if store has any slots available
    	for (var key in currentStoreSlots) {
    		for (var date in currentStoreSlots[key]) {
    			if (currentStoreSlots[key][date] === true){
		    		this.slotsAvailable = true;
		    	}
    		}
		}
	},

	confirmSelection () {

		/* check if slot user selected is still available */
		// get slot date and hour
		let date_time_regex = /(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}-\d{2}:\d{2})/g;
	    let matches = date_time_regex.exec(this.selectedTime);

		// check if user already has slot
		var slot = shoppingCart.getSlot();

        apiService.confirmSlotSelection(this.selectedStore, matches[1], matches[2]).end((err, res)=>{

		   		if (res.ok) {

		   			for (var date in res.body) {

		   				for (var boolean_value in res.body[date]) {

		   					if (res.body[date][boolean_value]){

								console.log('slot available');

		   						// user needs basketid, and to select a slot, before they can add a slot to basket
								if (sessionStorage.getItem('sbXmasBasketId') && this.selectedTime && this.selectedStore){

									this.addSlotToBasket();
								} else if (this.selectedTime && this.selectedStore){

									// create basket, store basket id in sessionStorage, then assign slot
                                    apiService.createBasket().then((res)=>{

											if (res.ok) {

												sessionStorage.setItem('sbXmasBasketId', res.body.id);
												this.addSlotToBasket();
											} else {

												console.log('Oh no! error ' + res.text);
											}
										});
								}

				   			} else {

								// if user has selected their existing slot, redirect them to slot confirmation page
								var slot_start_hour = slot.slot_hour;
								if (slot.slot_hour < 10) {
									slot_start_hour = '0' + slot.slot_hour;
								}
								var slot_hour_regex = /(\d\d)/g;
							    var slot_hour_match = slot_hour_regex.exec(boolean_value);
								if (slot.slot_date === date && slot_start_hour == slot_hour_match[1] && slot.store_code === this.selectedStore){
									window.location = '/slot-confirmed';
								}

				   				console.log('slot not available');
								// update SlotMatrix
								this.props.getCurrentStoreSlots(this.selectedStore, this.props.storeName);
				   			}
		   				}
		   			}

				} else {

					// slot api call failed
					console.log('Oh no! error ' + res.text);
				}

		   });
	},

	addSlotToBasket () {

		let dateTimeRegex = /(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}-\d{2}:\d{2})/g,
            matches = dateTimeRegex.exec(this.selectedTime),
            currentDate = new Date(),
            threeHoursLater = new Date(currentDate.getTime() + (3 * 60 * 60 * 1000)),
            slotExpiryTime = threeHoursLater.getHours() + ':' + (threeHoursLater.getMinutes()<10?'0':'') + threeHoursLater.getMinutes() + (currentDate.toDateString() === threeHoursLater.toDateString() ? ' today' : ' tomorrow');

        apiService.addSlotToBasket(sessionStorage.getItem('sbXmasBasketId'), this.selectedStore, matches[1], matches[2]).end((err, res)=>{
            if (res.ok) {
                sessionStorage.setItem('slotExpiryTime', slotExpiryTime);

                window.location = symfonyConfig.symfonyEnvironment + "/slot-confirmed";
            } else {
                console.log('Oh no! error ' + res.text);
            }
        });
	},

	componentDidMount () {

		// check if user already has slot
		var slot = shoppingCart.getSlot();

		var slotItems = document.querySelectorAll('.time_slot'),
            confirmSelection = document.querySelector('.confirm_selection');

		for (var i = 0; i < slotItems.length; i++) {
            slotItems[i].addEventListener('click', (e)=>{

				e.preventDefault();

				// deselect active timeslot
				if (e.target.className.indexOf("active") >= 0){

					e.target.className = 'time_slot';
					this.selectedStore = '';
					this.selectedTime = '';

					// add disabled class to "Confirm Selection" button
					confirmSelection.className = 'confirm_selection disabled';

				} else {

					// remove "active" class from all non-disabled time slots
					for (var i = 0; i < slotItems.length; i++) {

						if (slotItems[i].className.indexOf("disabled") === -1){
                            slotItems[i].className = 'time_slot';
						}
					}

					// add "active" class to clicked on slot, set selectedTime, selectedStore. only if field is not disabled
					if (e.target.className.indexOf("disabled") === -1){

						e.target.className = 'time_slot active';

						// update selected store and slot time
						this.selectedStore = e.target.getAttribute('data-store');
					    this.selectedTime = e.target.getAttribute('data-date') + ' ' + e.target.innerHTML;

					    // remove disabled class from "Confirm Selection" button
					    confirmSelection.className = 'confirm_selection';

						if (slot.id === undefined){
							confirmSelection.focus();
						}

					} else {

						this.selectedStore = '';
						this.selectedTime = '';

						// add disabled class to "Confirm Selection" button
						confirmSelection.className = 'confirm_selection disabled';
					}
				}

				// Analytics

				digitalData.event.push({'eventInfo':{
					'eventName': 'timeSelected',
					'deliverySlot' : this.selectedTime //delivery slot selected, format hh:mm-hh:mm|dd/mm/yy    
				}});

			});
		}

		// if user already has slot, autopopulate slot
		if (slot.id){

			var slot_start_hour = slot.slot_hour;
			if (slot.slot_hour < 10) {
				slot_start_hour = '0' + slot.slot_hour;
			}

			var selectedSlot = document.querySelector('[data-date="' + slot.slot_date + '"][data-time-slot^="' + slot_start_hour + '"][data-store="' + slot.store_code + '"]');

			if (selectedSlot){

				selectedSlot.className = 'time_slot';
				selectedSlot.click();
			}
		}
    },

    componentWillMount () {

    	this.storeSlotAvailabilityCheck(this.props.state.currentStoreSlots);
    },

    showMobileCollectionSlots () {

    	// activate collection slots panel
    	document.querySelector('.slot_matrix').style.display = "block";
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
    	document.querySelector('.slot_matrix').style.display = "none";
    	React.findDOMNode(this.refs.mobileCollectionSlotTab).className = "mobile_tab_menu";
    },

    render () {

		var slot = shoppingCart.getSlot();

        return (
        	<div className="slot_matrix_container">
        		<a id="select_a_collection_store_start"></a>
	            <h2>
		            {this.props.storeName}
		        </h2>

		        <div className="mobile_tab_menu_container">
		            <a className="mobile_tab_menu active" onClick={this.showMobileCollectionSlots} ref="mobileCollectionSlotTab">
		                Collection Slots
		            </a>
		            <a className="mobile_tab_menu" onClick={this.showMobileStoreDetails} ref="mobileStoreDetailsTab">
		                Store Details
		            </a>
		        </div>

		        <div className="slot_matrix inner-container">

		        	{this.slotsAvailable || (slot.id && (this.props.state.currentStoreId === slot.store_code)) ?

		        		<div>
							<h3>
				                Select a collection slot
				            </h3>

				            <div className="slots_col">
				                <div className="slot_date">
				                    Tue 22 Dec
				                </div>

								<Slots data={this.props.state.currentStoreSlots['2015-12-22']} date="2015-12-22" store={this.props.state.currentStoreId}/>

				            </div>

				            <div className="slots_col">
				                <div className="slot_date">
				                    Wed 23 Dec
				                </div>

				                <Slots data={this.props.state.currentStoreSlots['2015-12-23']} date="2015-12-23" store={this.props.state.currentStoreId} />

				            </div>

				            <div className="slots_col">
				                <div className="slot_date">
				                    Thu 24 Dec
				                </div>

				                <Slots data={this.props.state.currentStoreSlots['2015-12-24']} date="2015-12-24" store={this.props.state.currentStoreId} />

				            </div>

				            <button onClick={this.confirmSelection} className="confirm_selection btn disabled">
				                Confirm selection
				            </button>

				            <div className="choose_another_store">
				                or <a href="#" className="choose_another_store_link">choose another store</a>
			            	</div>
		            	</div>

		            :
		            	<div>
		            		<h3 className="no_slots_available">
		            			Sorry
		            		</h3>

		            		<p className="no_slots_available">
		            			Unfortunately, this store no longer has collection slots available. Please try an alternative store nearby.
		            		</p>

		            		<a href="#" className="choose_a_different_store">
								Choose a different store
							</a>
		            	</div>
		            }

		        </div>
	        </div>
        );
    }
});

export default SlotMatrix;
