'use strict';

import React from 'react';
import ApiService from '../../services/ApiService';
let apiService = new ApiService();

let ExceptionOpeningTimes = React.createClass({

	seasonal_opening_times:[

		{
			'opens':'',
			'closes':''
		},
		{
			'opens':'',
			'closes':''
		},
		{
			'opens':'',
			'closes':''
		},
		{
			'opens':'',
			'closes':''
		},
		{
			'opens':'',
			'closes':''
		}
	],

	populate_seasonal_opening_times (inputProps) {

		for (var day in inputProps.exception_times) {

			for (var obj_key in inputProps.exception_times[day]) {

				if (inputProps.exception_times[day][obj_key] === '2015-12-24') {

					this.seasonal_opening_times[0].opens = inputProps.exception_times[day]['start'];
					this.seasonal_opening_times[0].closes = inputProps.exception_times[day]['end'];
				}

				if (inputProps.exception_times[day][obj_key] === '2015-12-25') {

					this.seasonal_opening_times[1].opens = inputProps.exception_times[day]['start'];
					this.seasonal_opening_times[1].closes = inputProps.exception_times[day]['end'];
				}

				if (inputProps.exception_times[day][obj_key] === '2015-12-26') {

					this.seasonal_opening_times[2].opens = inputProps.exception_times[day]['start'];
					this.seasonal_opening_times[2].closes = inputProps.exception_times[day]['end'];
				}

				if (inputProps.exception_times[day][obj_key] === '2015-12-31') {

					this.seasonal_opening_times[3].opens = inputProps.exception_times[day]['start'];
					this.seasonal_opening_times[3].closes = inputProps.exception_times[day]['end'];
				}

				if (inputProps.exception_times[day][obj_key] === '2016-01-01') {

					this.seasonal_opening_times[4].opens = inputProps.exception_times[day]['start'];
					this.seasonal_opening_times[4].closes = inputProps.exception_times[day]['end'];
				}
			}
		}
	},

	componentWillMount () {

		this.populate_seasonal_opening_times(this.props);
	},

	componentWillReceiveProps (nextProps) {

		this.populate_seasonal_opening_times(nextProps);
	},

	render () {

        return (
        	<div>
        		<p className="opening_times_container">
	                <span className="seasonal_opening_hours_day">Christmas Eve</span>
	                <span className="opening_hours_times">{this.seasonal_opening_times[0].opens === null && this.seasonal_opening_times[0].closes === null ? 'Closed' : this.seasonal_opening_times[0].opens + ' - ' + this.seasonal_opening_times[0].closes}</span>
            	</p>

            	<p className="opening_times_container">
	                <span className="seasonal_opening_hours_day">Christmas Day</span>
	                <span className="opening_hours_times">{this.seasonal_opening_times[1].opens === null && this.seasonal_opening_times[1].closes === null ? 'Closed' : this.seasonal_opening_times[1].opens + ' - ' + this.seasonal_opening_times[1].closes}</span>
            	</p>

            	<p className="opening_times_container">
	                <span className="seasonal_opening_hours_day">Boxing Day</span>
	                <span className="opening_hours_times">{this.seasonal_opening_times[2].opens === null && this.seasonal_opening_times[2].closes === null ? 'Closed' : this.seasonal_opening_times[2].opens + ' - ' + this.seasonal_opening_times[2].closes}</span>
            	</p>

            	<p className="opening_times_container">
	                <span className="seasonal_opening_hours_day">New Year's Eve</span>
	                <span className="opening_hours_times">{this.seasonal_opening_times[3].opens === null && this.seasonal_opening_times[3].closes === null ? 'Closed' : this.seasonal_opening_times[3].opens + ' - ' + this.seasonal_opening_times[3].closes}</span>
            	</p>

            	<p className="opening_times_container">
	                <span className="seasonal_opening_hours_day">New Year's Day</span>
	                <span className="opening_hours_times">{this.seasonal_opening_times[4].opens === null && this.seasonal_opening_times[4].closes === null ? 'Closed' : this.seasonal_opening_times[4].opens + ' - ' + this.seasonal_opening_times[4].closes}</span>
            	</p>
            </div>
        );
    }
});

let CustomerFacility = React.createClass({

	render () {

        return (
        	<div>
        		{this.props.data.category === 'Customer facilities' &&
		        	<p>
		           		{this.props.data.name}
	            	</p>
	            }
        	</div>
        );
    }
});

let Services = React.createClass({

	render () {

        return (
        	<div>
	            {this.props.data.category === 'Services' &&
		        	<p>
		           		{this.props.data.name}
	            	</p>
	            }
        	</div>
        );
    }
});

let FoodCounters = React.createClass({

	render () {

        return (
        	<div>
	            {this.props.data.category === 'Food counters' &&
		        	<p>
		           		{this.props.data.name}
	            	</p>
	            }
        	</div>
        );
    }
});

let StoreDetails = React.createClass({

	getInitialState () {
        return {
            this_store:null
        };
    },

	viewAllStoreDetails (event) {

		event.preventDefault();
      	document.querySelector('.additional_store_details').style.display='block';
      	document.querySelector('#view_all_store_details').style.display='none';
	},

	getStoreDetails (storeCode) {

        apiService.getStoreDetails(storeCode).end((err, res)=>{
            if (res.ok) {
                this.setState({
                    this_store:res.body
                });
            }
        });
	},

	storeDetailsLinkScroll () {

		// <a> tags with class "scroll_to_store_details", scroll to store details section when clicked
		var scroll_to_store_details = document.getElementsByClassName('scroll_to_store_details');
		var headerHeight = document.querySelector('.header').offsetHeight;

		for(var i = 0; i < scroll_to_store_details.length; i++) {

			scroll_to_store_details[i].addEventListener('click', function(event){

				if (window.innerWidth >= 980) {

					window.scrollTo(0, document.getElementById('store_details_start').getBoundingClientRect().top + window.pageYOffset - headerHeight);
				} else {

					window.scrollTo(0, document.getElementById('select_a_collection_store_start').getBoundingClientRect().top + window.pageYOffset - headerHeight);
				}
			});
		}
	},

	componentDidMount () {
		this.getStoreDetails(this.props.store_code);
		this.storeDetailsLinkScroll();
	},

	componentWillReceiveProps (nextProps) {
		this.getStoreDetails(nextProps.store_code);
		this.storeDetailsLinkScroll();
	},

    render () {

    	if (this.state.this_store) {
	        return (
	        	<div className="store_details_container">
		        	<div className="store_details_section">
		        		<a id="store_details_start"></a>
			            <ul className="store_details inner-container">
				            <h3>
				                Store details
				            </h3>

				            <li className="store_details_col">
				                <div className="store_details_item">
				                    <h4>
				                        Address
				                    </h4>

				                    <p className="store_details_store_address">
				                        {this.state.this_store.contact.address1}<br/>
										{this.state.this_store.contact.address2}<br/>
										{this.state.this_store.contact.city}, {this.state.this_store.contact.post_code}
				                    </p>
				                </div>

				                <div className="store_details_item">
				                    <h4>
				                        Store manager
				                    </h4>

				                    <p>
				                        {this.state.this_store.contact.manager}
				                    </p>
				                </div>

				                <div className="store_details_item">
				                    <h4>
				                        Phone number
				                    </h4>

				                    <p>
				                        {this.state.this_store.contact.telephone}
				                    </p>
				                </div>
				            </li>

				            <li className="store_details_col">
				                <div className="store_details_item opening_hours">
				                    <h4>
				                        Opening hours
				                    </h4>

				                    <p className="opening_times_container">
				                        <span className="opening_hours_day">Monday</span>
				                        <span className="opening_hours_times">{this.state.this_store.opening_times.monday.start} - {this.state.this_store.opening_times.monday.end}</span>
				                    </p>

				                    <p className="opening_times_container">
				                        <span className="opening_hours_day">Tuesday</span>
				                        <span className="opening_hours_times">{this.state.this_store.opening_times.tuesday.start} - {this.state.this_store.opening_times.tuesday.end}</span>
				                    </p>

				                    <p className="opening_times_container">
				                        <span className="opening_hours_day">Wednesday</span>
				                        <span className="opening_hours_times">{this.state.this_store.opening_times.wednesday.start} - {this.state.this_store.opening_times.wednesday.end}</span>
				                    </p>

				                    <p className="opening_times_container">
				                        <span className="opening_hours_day">Thursday</span>
				                        <span className="opening_hours_times">{this.state.this_store.opening_times.thursday.start} - {this.state.this_store.opening_times.thursday.end}</span>
				                    </p>

				                    <p className="opening_times_container">
				                        <span className="opening_hours_day">Friday</span>
				                        <span className="opening_hours_times">{this.state.this_store.opening_times.friday.start} - {this.state.this_store.opening_times.friday.end}</span>
				                    </p>

				                    <p className="opening_times_container">
				                        <span className="opening_hours_day">Saturday</span>
				                        <span className="opening_hours_times">{this.state.this_store.opening_times.saturday.start} - {this.state.this_store.opening_times.saturday.end}</span>
				                    </p>

				                    <p className="opening_times_container">
				                        <span className="opening_hours_day">Sunday</span>
				                        <span className="opening_hours_times">{this.state.this_store.opening_times.sunday.start} - {this.state.this_store.opening_times.sunday.end}</span>
				                    </p>
				                </div>
				            </li>

				            <li className="store_details_col">
				                <div className="store_details_item opening_hours">
				                    <h4>
				                        Seasonal opening hours
				                    </h4>

				                    <ExceptionOpeningTimes exception_times={this.state.this_store.exception_times}/>

				                </div>
				            </li>
				        </ul>

				        <a href="#" id="view_all_store_details" className="view_all_store_details" onClick={this.viewAllStoreDetails}>
				            View all store details
				        </a>

				        <div className="additional_store_details">
					        <ul className="store_details inner-container">

					            <li className="store_details_col">
					                <div className="store_details_item">
					                    <h4>
					                        Customer facilities
					                    </h4>

					                    {this.state.this_store.facilities.map(function(result) {
										   return <CustomerFacility key={result.id} data={result}/>;
										})}

					                </div>
					            </li>

					            <li className="store_details_col">
					                <div className="store_details_item">
					                    <h4>
					                        Services
					                    </h4>

					                    {this.state.this_store.facilities.map(function(result) {
										   return <Services key={result.id} data={result}/>;
										})}
					                </div>
					            </li>

					            <li className="store_details_col">
					                <div className="store_details_item">
					                    <h4>
					                        Food counters
					                    </h4>

					                    {this.state.this_store.facilities.map(function(result) {
										   return <FoodCounters key={result.id} data={result}/>;
										})}
					                </div>
					            </li>
					        </ul>
				        </div>
			        </div>
		        </div>
	        );
		}

		return <img id="store_details_loading_gif" src="../../../../../compiled/assets/img/icons/loader.gif" />;
    }
});

export default StoreDetails;
