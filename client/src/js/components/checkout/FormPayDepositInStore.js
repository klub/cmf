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

        isValidEntry ? this.validationService.toggleError(parent, false, '', 'pay-deposit') : this.validationService.toggleError(parent, true, this.inputProps.ifInvalid, 'pay-deposit');
    }

    //fix for auto-fill
    handleChange(pattern, e){
        var isValidEntry = this.validationService.validateEntry(e.target.value, pattern),
            parent = React.findDOMNode(this).parentNode;

        isValidEntry ? this.validationService.toggleError(parent, false, '', 'pay-deposit') : this.validationService.toggleError(parent, true, this.inputProps.ifInvalid, 'pay-deposit');
    }

	render(){
		return (
			<div>
				<label htmlFor={this.inputProps.id}>{this.inputProps.label}</label>
				<p>{this.inputProps.info}</p>
				<input type={this.inputProps.type || 'text'} name={this.inputProps.name} id={this.inputProps.id} ref={this.inputProps.id} placeholder={this.inputProps.placeholder} onKeyUp={this.validationService.debounce(()=>{this.handleKeyUp(this.refs[this.inputProps.id].getDOMNode().value, this.inputProps.pattern)}, 1500)} />
				<p className="error"></p>
			</div>
		)
	}
}

class Checkbox extends React.Component {

    constructor() {
        super();
        this.validationService = new ValidationService();
        this.state = {
            checked : false,
            pristine : 'pristine'
        }
    }

    handleChange(e) {
        this.setState({
            checked : this.refs[this.inputProps.id].getDOMNode().checked
        })

        this.checked = e.target.checked;
        var hasErrors = this.validationService.checkForErrors('pay-deposit'),
            submitButton = document.getElementById('submit-form');

        !hasErrors ? submitButton.removeAttribute('disabled') : submitButton.setAttribute('disabled', 'disabled');
    }

	componentWillMount(){
		this.inputProps = JSON.parse(this.props.data);
	}

	render(){
		return (
			<div>
				<input className="required-checkbox" type="checkbox" name={this.inputProps.name} id={this.inputProps.id} ref={this.inputProps.id} checked={this.state.checked} onChange={this.handleChange.bind(this)} />
                <label className="checkbox" htmlFor={this.inputProps.id}> {this.inputProps.text}</label>
			</div>
		)
	}
}

class PayDepositForm extends React.Component {

	render(){
		return (
			<div>
				<ul id="pay-deposit">
					<li className="pristine">
						<Input data={'{"label" : "Colleague name", "id" : "name", "name" : "store_transaction[employeeName]", "placeholder" : "", "ifInvalid" : "Please enter the colleague\'s name", "pattern" : "empty"}'} />
					</li>
					<li>
						<Checkbox data={'{"id" : "confirm-deposit", "name" : "store_transaction[confirmation]", "text" : "I have taken £10 payment from the customer."}'} />
					</li>
				</ul>
				<p className="button"><button type="submit" id="submit-form" className="btn" disabled="disabled">Place order</button></p>
			</div>
		)
	}
}

export default PayDepositForm;
