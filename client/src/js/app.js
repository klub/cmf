/**
 * Main app entry point
 */

import React from 'react';
import ProductList from './components/product/ProductList';
import ProductDetail from './components/product/ProductDetail';
import MiniBasket from './components/basket/MiniBasket';
import Basket from './components/basket/Basket';
import OrderSummary from './components/basket/OrderSummary';
import BasketOutOfStock from './components/basket/BasketOutOfStock';
import MiniBasketHeaderLink from './components/basket/MiniBasketHeaderLink';
import ArrangeSlot from './components/slots/ArrangeSlot';
import SlotReservedConfirmation from './components/slots/SlotReservedConfirmation';
import SlotHeader from './components/slots/SlotHeader';
import CustomerDetailsForm from './components/checkout/FormCustomerDetails';
import BillingForm from './components/checkout/FormBilling';
import PayDepositForm from './components/checkout/FormPayDepositInStore';
import BurgerMenu from './scripts/BurgerMenu';
import StoreDetails from './components/common/StoreDetails';
import StoreAddress from './components/common/StoreAddress';
import Accordian from './scripts/Accordian';
import Skip from './scripts/Skip';
import CloseSelects from './scripts/CloseSelects';
import {Amend, Cancel} from './components/amend/AmendOrder';
import payment from './scripts/Payment';

if(document.getElementById('product-list-container')) {
    let category = document.getElementById('product-list-container').getAttribute('data-category');
    React.render(<ProductList category={category} />, document.getElementById('product-list-container'));
    document.addEventListener('click', CloseSelects, false);
}

if(document.getElementById('add-to-trolley')) {
    let parentSku = document.querySelector('.add-to-trolley-container').getAttribute('data-parent-sku');
    React.render(<ProductDetail parentsku={parentSku}  />, document.getElementById('add-to-trolley'));
}

//don't show mini basket on main basket page
if(document.getElementById('mini-basket-container') && !document.getElementById('main-basket-container')) {
	React.render(<MiniBasket />, document.getElementById('mini-basket-container'));
}
// show mini basket image link on header of mini basket page
if(document.getElementById('main-basket-container')) {
    React.render(<MiniBasketHeaderLink />, document.getElementById('mini-basket-container'));
}

if(document.getElementById('main-basket-container')) {
    let orderId = document.getElementById('order-summary').getAttribute('data-order');
    React.render(<Basket />, document.getElementById('basket-in-stock'));
    React.render(<OrderSummary orderID={orderId}/>, document.getElementById('order-summary'));
}

if(document.getElementById('arrange_slots')) {
	React.render(<ArrangeSlot />, document.getElementById('arrange_slots'));
}

if(document.getElementById('slot_reserved_confirmation')) {
	React.render(<SlotReservedConfirmation />, document.getElementById('slot_reserved_confirmation'));
}

if(document.getElementById('slot-header-container')) {
	React.render(<SlotHeader />, document.getElementById('slot-header-container'));
}

if(document.getElementById('checkout-customer-details')) {
    let isInStore = !!document.getElementById('checkout-customer-details').getAttribute('data-instore') || false;
    React.render(<CustomerDetailsForm isInStore={isInStore} />, document.getElementById('checkout-customer-details'));
}

if(document.getElementById('billing-details')) {
    React.render(<BillingForm />, document.getElementById('billing-details'));
}

if(document.getElementById('order-confirmation-store-details')) {
    let storeId = document.getElementById('order-confirmation-store-details').getAttribute('data-store-id');
    React.render(<StoreAddress store_code={storeId} />, document.getElementById('store-address'));
    React.render(<StoreDetails store_code={storeId} />, document.getElementById('order-confirmation-store-details'));
}

if(document.getElementById('pay-deposit-container')) {
    React.render(<PayDepositForm />, document.getElementById('pay-deposit-container'));
}

if(document.getElementById('amend-button')){
    React.render(<Amend />, document.getElementById('amend-button'));
}

if(document.getElementById('amend-bar')){
    React.render(<Cancel />, document.getElementById('cancel-amend'));
}

if(document.getElementById('product-accordian')){
    Accordian();
}

if(document.getElementById('cardpayment')){
  payment();
}

Skip();
