import React from 'react';
import ValidationService from '../../services/ValidationService';


class XmasTCs extends React.Component {

    constructor() {
        super();
        this.validationService = new ValidationService();
    }

    componentWillMount(){
        this.state = {
            offersChecked : this.props.storedValues.offers,
            agreeChecked : this.props.storedValues.agree
        }
    }

    handleChange(e) {

        this.setState({
            offersChecked : this.refs.offers.getDOMNode().checked,
            agreeChecked : this.refs.tcs.getDOMNode().checked
        })

        console.log('2', this.state.agreeChecked)

        var hasErrors = this.validationService.checkForErrors(),
            submitButton = document.getElementById('submit-form');

        !hasErrors ? submitButton.removeAttribute('disabled') : submitButton.setAttribute('disabled', 'disabled');
    }

    render(){
        return (
            <ul className="tcs clearfix">
                <li className="clearfix">
                    <input ref="offers" type="checkbox" id="agree-contact" name="basket[marketing]" checked={this.state.offersChecked} onChange={this.handleChange.bind(this)} /><label className="checkbox" htmlFor="agree-contact"> We'd love to keep in touch with you by post, phone, SMS, email and other electronic means with money off vouchers, exclusive offers and the latest info, from Sainsbury's and Sainsbury's companies.</label>
                </li>
                <li className="clearfix">
                    <input className="required-checkbox" ref="tcs" type="checkbox" id="agree-tcs" name="basket[termsAndConditions]" checked={this.state.agreeChecked} onChange={this.handleChange.bind(this)} /><label className="checkbox" htmlFor="agree-tcs"> I agree with Sainsbury's <a href="terms" target="_blank">Terms and Conditions</a> and <a href="http://help.sainsburys.co.uk/help/website/privacy-policy-commitment" target="_blank">Privacy Policy</a>. Please be assured we'll treat your information with the utmost care and will never sell it to other companies for marketing purposes.</label>
                </li>
            </ul>
        )
    }
}

export default XmasTCs;