'use strict';

import React from 'react';
import SlotSearchBox from './SlotSearchBox'
import NearestStores from './NearestStores'
import SlotMatrix from './SlotMatrix'
import ApiService from '../../services/ApiService';

let apiService = new ApiService();

let SlotRequiredNotice = React.createClass({

	render () {
        return (
        	<div>
            	{document.getElementById('flash_no_slot_selected').innerHTML.length > 0 &&
                    <div className="no_slot_selected_notice">
                        <div className="inner-container">
                            Before you can place your order, please choose a collection slot. Please note that your collection slot will time out if you don’t place an order within 3 hours.
                        </div>
                    </div>
            	}
            </div>
        );
    }
});

let ArrangeSlot = React.createClass({

	getInitialState () {
        return {
            stores:[],
            currentStoreId:null,
            currentStoreSlots:null,
            firstSlot:false,
            showMap:false
        };
    },

    callStoreLocatorAPI (latLong, inputString) {

    	var searchQuery = latLong ? 'lat=' + latLong.lat + '&lon=' + latLong.long : 'query=' + inputString,
            nearestStoresResults = document.querySelector('.nearest_stores_results'),
            nearestStoreInfoMessage = document.querySelector('.nearest_store_info_message');

        apiService.callStoreLocatorAPI(searchQuery).end((err, res)=>{
                if (res.ok) {

                    if (res.body.stores.length > 0){

                        nearestStoresResults.style.display = "block";
                        nearestStoreInfoMessage.style.display = "none";

                        this.setState({
                            stores:res.body.stores,
                            showMap:true
                        });

                    } else {

                        nearestStoreInfoMessage.style.display = "block";
                        nearestStoresResults.style.display = "none";

                        this.setState({
                            stores:res.body.stores,
                            showMap:false
                        });
                    }

                } else {
                    nearestStoresResults.style.display = "none";
                    nearestStoreInfoMessage.style.display = "none";
                }
            }
        );
    },

    getStoresFromAPI (userInput) {

    	var geocoder = new google.maps.Geocoder();

		geocoder.geocode({'address': userInput, 'region':'uk'}, (results, status)=>{

			if (status === google.maps.GeocoderStatus.OK) {

				this.callStoreLocatorAPI({'lat':results[0].geometry.location.G,'long':results[0].geometry.location.K}, null);

			} else {
				//console.log('Geocode was not successful for the following reason: ' + status);
				this.callStoreLocatorAPI(null, userInput);
			}
		});
    },

    getCurrentStoreSlots (storeId, storeName) {

        var slotMatrixPlaceholder = document.getElementById('slot_matrix_placeholder');

        apiService.getCurrentStoreSlots(storeId).end((err, res)=>{
            if (res.ok) {

                this.setState({
                    currentStoreId:storeId,
                    currentStoreSlots:res.body
                });

                React.unmountComponentAtNode(slotMatrixPlaceholder);
                React.render(<SlotMatrix storeName={storeName} firstSlot={this.state.firstSlot} state={this.state}/>, slotMatrixPlaceholder);

            } else {

                console.log('Oh no! error ' + res.text);
            }
        });
    },

    render () {
        return (
            <div>
            	<SlotRequiredNotice />
            	<SlotSearchBox getStoresFromAPI={this.getStoresFromAPI} />
            	<NearestStores state={this.state} getCurrentStoreSlots={this.getCurrentStoreSlots} focusFirstSlot={this.focusFirstSlot}/>
            	<div className="collection_slot_store_details">
            		<div id="slot_matrix_placeholder"></div>
            		<div id="store_details_placeholder"></div>
            	</div>
            </div>
        );
    }
});

export default ArrangeSlot;
