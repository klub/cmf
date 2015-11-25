import React from 'react';
import ApiService from './../../services/ApiService.js';

var apiService = new ApiService();

let Amend = React.createClass({

	handleClick (e) {

		var parent  = document.getElementById('amend-button'),
			orderID = parent.getAttribute('data-order');

		console.log(orderID);

		sessionStorage.setItem('sbXmasBasketId',orderID);

		apiService.updateOrder().end(function(data){
			location.href = symfonyConfig.symfonyEnvironment + '/basket';
		});

	},

	render () {

		return (
			<a href="#" className="amend" onClick={this.handleClick}>
	        Amend my order
	    </a>
		)
	}
});

let Cancel = React.createClass({

		handleClick (e) {

			var parent  = document.getElementById('cancel-amend'),
				orderID = parent.getAttribute('data-order');

			apiService.cancelAmend(orderID).end(function (data) {
				location.href = symfonyConfig.symfonyEnvironment + '/';
			});
		},

		render () {

			return(
				<a href="#" onClick={this.handleClick}>Exit amend</a>
			)
		}

});

export {Amend, Cancel};
