import React from 'react';

class ValidationService extends React.Component {

    constructor(){
        super();
        this.emailPattern = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)*$/;
        this.phonePattern = /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;
        this.postcodePattern = /^(([a-zA-Z]{1,2}[0-9]{1,2})|([a-zA-Z]{1,2}[0-9][a-zA-Z]))\s?([0-9][a-zA-Z]{2})$/;
    }

    debounce(fn, delay) {
        var timer = null;
        return function () {
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn(args);
            }, delay);
        };
    }

    validateEntry(value, pattern){
        var isValid = true;

        switch(pattern){
            case 'empty':
                if(value.length === 1){
                    isValid = false;
                }
                break;
            case 'email':
                if(value.length > 0 && !this.emailPattern.test(value)){
                    isValid = false;
                }
                break;
            case 'confirm':
                if(value !== document.getElementById('email').value){
                    isValid = false;
                }
                break;
            case 'phone':
                if(value.length > 0 && !this.phonePattern.test(value)){
                    isValid = false;
                }
                break;
            case 'postcode':
                if(value.length > 0 && !this.postcodePattern.test(value)){
                    isValid = false;
                }
                break;
        }
        return isValid;
    }

    checkForErrors(id){
        var id = id || 'checkout-customer-details',
            lis = document.getElementById(id).getElementsByTagName('li'),
            checkbox = document.getElementsByClassName('required-checkbox')[0],
            hasErrors = false, li, length;

        for(var i = 0, j = lis.length; i < j; i++){
            li = lis[i],
            length = li.getElementsByTagName('input')[0].value.length;

            if(li.className.indexOf('pristine') !== -1 || (li.className.indexOf('error') !== -1 && li.className.indexOf('optional') === -1) || (length < 1 && li.className.indexOf('optional') === -1) || (checkbox && !checkbox.checked)){
                hasErrors = true;
                break;
            }
        }

        return hasErrors;
    }

    toggleError(parent, showError, invalidMessage, id){
        var hasErrors,
            submitButton = document.getElementById('submit-form'),
            message = document.getElementById('message');

        if(showError){
            parent.querySelector('.error').innerHTML = invalidMessage && invalidMessage;
            if(parent.className.indexOf('optional') !== -1){
                parent.className = 'optional error';
            } else {
                parent.className = 'error';
            }
            submitButton.setAttribute('disabled', 'disabled');
        } else {
            if(parent.className.indexOf('optional') !== -1){
                parent.className = 'optional';
            } else {
                parent.className = '';
            }
            parent.querySelector('.error').innerHTML = '';
            hasErrors = this.checkForErrors(id);
            !hasErrors ? submitButton.removeAttribute('disabled') : submitButton.setAttribute('disabled', 'disabled');
        }
    }
}

export default ValidationService;