'use strict';

import React from 'react';
import ValidationService from '../../services/ValidationService';
import XmasTCs from './XmasTCsComponent';

class Input extends React.Component {

	constructor() {
		super();
        this.validationService = new ValidationService();
        this.handleChange = this.handleChange.bind(this);
	}

	componentWillMount(){
		this.inputProps = JSON.parse(this.props.data);
	}

    handleKeyUp(value, pattern){

        var isValidEntry = this.validationService.validateEntry(value, pattern),
            parent = React.findDOMNode(this).parentNode;

        isValidEntry ? this.validationService.toggleError(parent, false) : this.validationService.toggleError(parent, true, this.inputProps.ifInvalid);
    }

    //fix for auto-fill
    handleChange(pattern, e){
        var isValidEntry = this.validationService.validateEntry(e.target.value, pattern),
            parent = React.findDOMNode(this).parentNode;

        isValidEntry ? this.validationService.toggleError(parent, false) : this.validationService.toggleError(parent, true, this.inputProps.ifInvalid);
    }

    componentDidMount(){
        if(this.props.storedValue) {
            this.refs[this.inputProps.id].getDOMNode().value = this.props.storedValue;
            this.validationService.toggleError(React.findDOMNode(this).parentNode);
        }
    }

	render(){
		return (
			<div>
				<label htmlFor={this.inputProps.id}>{this.inputProps.label} {this.props.isInStore && ' (optional)'}</label>
				<p>{this.inputProps.info}</p>
				<input type={this.inputProps.type || 'text'} name={this.inputProps.name} id={this.inputProps.id} ref={this.inputProps.id} onKeyUp={this.validationService.debounce(()=>{this.handleKeyUp(this.refs[this.inputProps.id].getDOMNode().value, this.inputProps.pattern)}, 1500)} onChange={this.validationService.debounce(()=>{this.handleKeyUp(this.refs[this.inputProps.id].getDOMNode().value, this.inputProps.pattern)}, 1500)} />
				<p className="error"></p>
			</div>
		)
	}
}

class CustomerDetailsForm extends React.Component {

	constructor() {
		super();
        this.validationService = new ValidationService();
        this.customerDetails = JSON.parse(sessionStorage.getItem('customerDetails')) || {};
	}

	componentDidMount() {

		// save form values to local storage
		document.getElementById('submit-form').addEventListener('click', () => {
			var customerDetailsObject = {'firstname':document.getElementById('name').value, 'lastname':document.getElementById('lastname').value, 'email':document.getElementById('email').value, 'number':document.getElementById('tel').value, 'offers':document.getElementById('agree-contact').checked, 'agree':document.getElementById('agree-tcs').checked};
			sessionStorage.setItem('customerDetails', JSON.stringify(customerDetailsObject));
		});
	}

	render(){
        return (
			<div>
				<ul id="customer-details">
					<li className="pristine">
						<Input storedValue={this.customerDetails.firstname} data={'{"label" : "First name", "id" : "name", "name" : "basket[firstName]", "ifInvalid" : "Please enter your first name", "pattern" : "empty"}'} />
					</li>
					<li className="pristine">
						<Input storedValue={this.customerDetails.lastname} data={'{"label" : "Last name", "id" : "lastname", "name" : "basket[lastName]", "ifInvalid" : "Please enter your last name", "pattern" : "empty"}'} />
					</li>
					<li className={this.props.isInStore ? 'optional' : 'pristine'}>
						<Input storedValue={this.customerDetails.email} isInStore={this.props.isInStore} data={'{"type" : "email", "info" : "We\'ll need this to send you a confirmation email", "label" : "Email address", "id" : "email", "name" : "basket[email][first]", "ifInvalid" : "Please enter a valid email address", "pattern" : "email"}'} />
					</li>
					<li className={this.props.isInStore ? 'optional' : 'pristine'}>
						<Input storedValue={this.customerDetails.email} isInStore={this.props.isInStore} data={'{"type" : "email", "info" : "Confirm email address", "label" : "Confirm your email address", "id" : "confirm-email", "name" : "basket[email][second]", "ifInvalid" : "This does not match", "pattern" : "confirm"}'} />
					</li>
					<li className="pristine">
						<Input storedValue={this.customerDetails.number} data={'{"type" : "tel", "info" : "In case we need to get in touch about your order", "label" : "Contact number", "id" : "tel", "name" : "basket[phoneNumber]", "ifInvalid" : "Please enter a valid phone number", "pattern" : "phone"}'} />
					</li>
				</ul>
				<h2>Nectar rewards</h2>
				<p className="nectar">You'll earn Nectar points on your Christmas order when you pay the balance in-store.</p>
				<h2>Terms &amp; conditions</h2>
				<XmasTCs storedValues={this.customerDetails} />
				<p className="button"><button type="submit" id="submit-form" className="btn" disabled="disabled">Continue</button></p>
			</div>
		)
	}
}

export default CustomerDetailsForm;
