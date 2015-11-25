import React from 'react';
import {cursors, shoppingCart} from './../../services/ShoppingCart.js';
import ApiService from './../../services/ApiService.js';

var apiService = new ApiService();

class OrderSummary extends React.Component {

    constructor() {
        super();
        this.state = {
            items: [],
            estimatedTotal : 0,
            disabled : false,
            checkoutPage: symfonyConfig.symfonyEnvironment + '/checkout'
        };
    }

    componentDidMount() {

        cursors.basketItems.on('update', () => {
            this.setState({
                orderID : this.props.orderID,
                estimatedTotal : 0,
                items: shoppingCart.getItems()
            });
        });
    }

    confirmChanges (id){

        if(!this.state.disabled){

          apiService.confirmAmend(id).end(function () {
              location.href = symfonyConfig.symfonyEnvironment + "/order/amend/confirm";
          });

        }
    }

    cancelChanges (id){

        apiService.cancelAmend(id).end(function () {
          location.href = symfonyConfig.symfonyEnvironment + "/";
        });
    }

    render(){
        this.state.items.map(
                item => {
                if (item.in_stock) {
                    this.state.estimatedTotal += (item.product.typical_price * item.quantity);
                }
            }
        )
        this.state.disabled  = this.state.estimatedTotal < 10;

        var orderID = this.props.orderID;
        var confirm = this.confirmChanges.bind(this,orderID);
        var cancel  = this.cancelChanges.bind(this,orderID);

        return (
            <div className="inner">
                <h3>Order summary</h3>
                <h4>Estimated total</h4>
                <p id="estimated-total"><span>&pound;{this.state.estimatedTotal.toFixed(2)}<sup>*</sup></span></p>
                <h4>{orderID ? 'Deposit paid' : 'Deposit to pay now'}</h4>
                <p className="to-pay-now">&pound;10.00</p>


                {orderID ?

                    <div>
                        <button className={this.state.disabled ? 'btn disabled' : 'btn'} disabled={this.state.disabled} onClick={confirm}>Confirm changes</button>
                        <button className="btn secondary" onClick={cancel}>Cancel changes</button>
                    </div>

                :
                  <form method="post" action={this.state.checkoutPage}>
                     <button id="goToCheckout" disabled={this.state.disabled} className={this.state.disabled ? 'btn disabled' : 'btn'}>Checkout</button>
                  </form>
                }

                <div className="caveat">
                    <p><span className="tooltip-icon black">!</span>
                        {this.state.disabled ? 'Please note that there is a minimum spend of £10 for Christmas pre-orders. The deposit secures your order. You\'ll receive your £10 back when you collect your order.' : '*This is an estimate total based on the typical price of the product. The final price is calculated by weight which is marked on the product on day of collection. If you decide to cancel your order, you will receive your deposit back as long as you cancel by the 15th December.'}
                    </p>
                </div>
            </div>
        )
    }
}

export default OrderSummary;
