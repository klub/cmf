'use strict';

import React from 'react';
import ValidationService from '../../services/ValidationService';

class Input extends React.Component {

	constructor() {
		super();
        this.validationService = new ValidationService();
	}

	componentWillMount(){
		this.inputProps = JSON.parse(this.props.data);
	}

    handleKeyUp(value, pattern){
        var isValidEntry = this.validationService.validateEntry(value, pattern),
            parent = React.findDOMNode(this).parentNode;

        isValidEntry ? this.validationService.toggleError(parent, false, '', 'billing') : this.validationService.toggleError(parent, true, this.inputProps.ifInvalid, 'billing');
    }

    //fix for auto-fill
    handleChange(pattern, e){
        var isValidEntry = this.validationService.validateEntry(e.target.value, pattern),
            parent = React.findDOMNode(this).parentNode;

        isValidEntry ? this.validationService.toggleError(parent, false, '', 'billing') : this.validationService.toggleError(parent, true, this.inputProps.ifInvalid, 'billing');
    }

	render(){
		return (
			<div>
				<label htmlFor={this.inputProps.id}>{this.inputProps.label}</label>
				<p>{this.inputProps.info}</p>
				<input type={this.inputProps.type || 'text'} name={this.inputProps.name} id={this.inputProps.id} ref={this.inputProps.id} onKeyUp={this.validationService.debounce(()=>{this.handleKeyUp(this.refs[this.inputProps.id].getDOMNode().value, this.inputProps.pattern)}, 1500)} onChange={this.validationService.debounce(()=>{this.handleKeyUp(this.refs[this.inputProps.id].getDOMNode().value, this.inputProps.pattern)}, 1500)} />
				<p className="error"></p>
			</div>
		)
	}
}


class BillingForm extends React.Component {

    componentDidMount(){
        this.submitButton = this.refs['submitButton'].getDOMNode();
        this.submitButton.setAttribute('disabled', 'disabled');

        document.querySelector('[name="billing_address"]').addEventListener('submit', ()=>{
            this.submitButton.setAttribute('disabled', 'disabled');
            this.submitButton.innerHTML = 'Submitting...';
        }, false);
    }

	render(){
		return (
			<div>
				<ul id="billing" className="clearfix">
					<li className="pristine">
						<Input data={'{"label" : "First name", "id" : "firstname", "name" : "billing_address[billingFirstName]", "ifInvalid" : "Please enter your first name", "pattern" : "empty"}'} />
					</li>
					<li className="pristine">
						<Input data={'{"label" : "Last name", "id" : "lastname", "name" : "billing_address[billingLastName]", "ifInvalid" : "Please enter your last name", "pattern" : "empty"}'} />
					</li>
					<li className="pristine">
						<Input data={'{"label" : "First line of billing address", "id" : "billing-address", "name" : "billing_address[billingAddress]", "ifInvalid" : "Please enter the first line of your billing address", "pattern" : "empty"}'} />
					</li>
					<li className="pristine">
						<Input data={'{"label" : "Postcode", "id" : "postcode", "name" : "billing_address[billingPostcode]", "ifInvalid" : "Please enter a valid postcode", "pattern" : "postcode"}'} />
					</li>
				</ul>
				<p className="button"><button type="submit" ref="submitButton" id="submit-form" className="btn">Continue</button></p>
			</div>
		)
	}
}

export default BillingForm;