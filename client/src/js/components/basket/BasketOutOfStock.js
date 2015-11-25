import React from 'react';
import ApiService from './../../services/ApiService.js';
import {cursors, shoppingCart} from './../../services/ShoppingCart.js';

class BasketItem extends React.Component {

    constructor() {
        super();
        this.removeItem = this.removeItem.bind(this);
        this.apiService = new ApiService();
        this.sbXmasBasketId = sessionStorage.getItem('sbXmasBasketId');
    }

    removeItem(item) {
        this.apiService.removeItem(this.sbXmasBasketId, item.id).then(() => {
            shoppingCart.removeItem(item);
        })
    }

    render(){
        return (
            <li className="item clearfix">
                <div className="thumbnail">
					<img className="product" src={'/images/products/' + this.props.item.product.product_sku + '_tile.jpg'}/>
                    <p className="remove">
                        <button onClick={this.removeItem.bind(this, this.props.item)}>Remove</button>
                    </p>
                </div>
                <div className="name">
                    <h3>{this.props.item.product.name}</h3>
                    <p>
                        <strong>Serves {this.props.item.product.min_serves}-{this.props.item.product.max_serves}</strong>
                        ({this.props.item.product.min_weight}-{this.props.item.product.max_weight} {this.props.item.product.weight_unit}) &pound;{this.props.item.product.price_per_kg}
                        <span>/ {this.props.item.product.weight_unit}</span>
                    </p>
                </div>
            </li>
        )
    }
}

class BasketOutOfStock extends React.Component {

    constructor() {
        super();
        this.state = {
            items: shoppingCart.getItems()
        };
    }

    componentDidMount() {
        cursors.basketItems.on('update', () => {

            this.setState({
                items: shoppingCart.getItems()
            });

        });
    }

    render(){
        return (
            <div>
                <h2>Out of stock items</h2>
                <ul className="out-of-stock">
                    {this.state.items.map(
                        item => {
                            if (!item.in_stock) {
                                return <BasketItem item={item}/>
                            }
                        }
                    )}
                </ul>
            </div>
        )
    }
}

export default BasketOutOfStock;