import React from 'react';
import ApiService from './../../services/ApiService.js';
import {cursors, shoppingCart} from './../../services/ShoppingCart';
import BasketOutOfStock from './BasketOutOfStock';

var sbXmasBasketId = sessionStorage.getItem('sbXmasBasketId'),
	  apiService = new ApiService();

class Basket extends React.Component {

	constructor(){
		super();
		var parsedBasket;
		this.state = {
			items: [],
			estimatedTotal : 0
		};
		this.hasOutOfStockItems = false;
		this.noBasketId = false;

		if(sbXmasBasketId){
			apiService.getBasketData(sbXmasBasketId).then(response => {
					parsedBasket = JSON.parse(response.text);

					if(parsedBasket.basket_items.length < 1){
						this.setState({
							basketIsEmpty : true
						});
					}

                    this.buildBaobab(parsedBasket);
				},
				error => {
					sessionStorage.removeItem('sbXmasBasketId');
					this.setState({
						basketIsEmpty : true
					});
				})
		} else {
			this.noBasketId = true;
		}
	}

	buildBaobab(basket){
		for(var i = 0, j = basket.basket_items.length; i < j; i++) {
			shoppingCart.addItem(basket.basket_items[i]);
		}

        // add slot to Baobab
		shoppingCart.addSlot(basket.slot);
	}

	componentDidMount() {

		cursors.basketItems.on('update', () => {
			var itemTally = 0,
                basketIsEmpty, items,
                outOfStockBanner = document.getElementById('out-of-stock-banner');
            this.hasOutOfStockItems = false;

			this.setState({
				estimatedTotal : 0,
				items: shoppingCart.getItems()
			});

			basketIsEmpty = this.state.items.length < 1;
			this.setState({basketIsEmpty : basketIsEmpty})

			this.state.items.filter(item => {
				itemTally += item.in_stock ? item.quantity : 0;
				return itemTally;
			});

			items = itemTally === 1  ? ' item' : ' items';
			document.getElementById('basket-item-count').innerHTML = itemTally + items;
			if(document.querySelector('.loading')) document.querySelector('.loading').className = '';

            if(this.hasOutOfStockItems){
                outOfStockBanner.className = 'visible';
            } else {
                outOfStockBanner.className = '';
            }

            sessionStorage.setItem('itemTally', itemTally);
		});

	}

	render(){
		return (
			<div className={!this.noBasketId ? 'loading' : ''}>
				{this.state.basketIsEmpty || this.noBasketId ?

					<p className="empty-basket">Bah humbug! Your trolley is empty</p>
					:
					<ul>
						{this.state.items.map(
								item => {
								if (item.in_stock) {
                                    return <BasketItem key={item.product.sku} item={item}/>;
								} else {
                                    this.hasOutOfStockItems = true;
								}
							}
						)}
					</ul>
				}

				{this.hasOutOfStockItems &&
					<BasketOutOfStock />
				}
			</div>
		)
	}
}

class BasketItem extends React.Component {

	constructor() {
		super();
		this.updateItemCount = this.updateItemCount.bind(this);
		this.removeItem = this.removeItem.bind(this);
		this.updateItem = this.updateItem.bind(this);
		this.state = {
			isOutOfStock : false
		}
	}

	updateItemCount(item, increment){
		var obj = {
			sku : item.product.sku,
			increment : increment
		};

		this.updateItem(item, obj);
	}

	removeItem(item) {
		apiService.removeItem(sbXmasBasketId, item.id).then(response => {
			shoppingCart.removeItem(item);

			// Analytics
			digitalData.event.push({'eventInfo':{
				'eventName': 'removeFromBasket',
				'type' : 'standard',
				'productSKU' : item.product.sku,
				'quantity' : item.quantity,
				'typicalPrice': item.typical_price,
				'minPrice': item.min_price,
				'maxPrice': item.max_price,
				'mode' : 'amend'
			}});
		})
	}

	updateItem(item, obj) {
		apiService.updateItem(sbXmasBasketId, obj).then(response => {
			var updatedItem = JSON.parse(response.text);
			//need to get the quantity from the update response before you you can delete it
			if(updatedItem.quantity === 0){
				apiService.removeItem(sbXmasBasketId, item.id).then(response => {
					shoppingCart.removeItem(item);

					// Analytics
					digitalData.event.push({'eventInfo':{
						'eventName': 'removeFromBasket',
						'type' : 'standard',
						'productSKU' : item.product.sku,
						'quantity' : item.quantity,
						'typicalPrice': item.typical_price,
						'minPrice': item.min_price,
						'maxPrice': item.max_price,
						'mode' : 'amend'
					}});
				})
			} else {
				shoppingCart.updateItemQuantity(updatedItem);

				// Analytics
				digitalData.event.push({'eventInfo':{
					'eventName': 'updateQuantity',
					'type' : 'standard',
					'productSKU' : updatedItem.product.sku,
					'quantity' : updatedItem.quantity,
					'typicalPrice': updatedItem.typical_price,
					'minPrice': updatedItem.min_price,
					'maxPrice': updatedItem.max_price,
					'mode' : 'amend'
				}});
			}
		}, err => {
			this.showMessage(err);
		})
	}

    showMessage(err){
        var error = JSON.parse(err.response.text),
            delay = 3000;

        if(err.status === 400){
            if(error.maximum_quantity){
                this.setState({exceededMaxQuantity: true});
                setTimeout(() => {
                    document.querySelector('.max-quantity').className = 'max-quantity';
                    this.setState({exceededMaxQuantity: false});
                }, delay);
            }
            if(error.out_of_stock){
                this.setState({isOutOfStock: true});
                setTimeout(() => {
                    document.querySelector('.is-out-of-stock').className = 'is-out-of-stock';
                    this.setState({isOutOfStock: false});
                }, delay);
            }
        }
    }

	render() {
        var item = this.props.item;
        var prod = this.props.item.product;

		return <li className="item clearfix" key={item.product.sku}>
					<div className="thumbnail">
						<img className="product" src={'/images/products/' + item.product.product_sku + '_tile.jpg'}/>
						<p className="remove">
							<button onClick={this.removeItem.bind(this, item)}>Remove</button>
						</p>
					</div>
					<div className="name">
						<h3 dangerouslySetInnerHTML={{__html: item.product.name }}></h3>
						<p>
							{prod.brand !== 'Floral Collection' ?
									<span>
										<strong>Serves {prod.min_serves == prod.max_serves ? prod.max_serves : prod.min_serves +"-"+ prod.max_serves}</strong>&nbsp;
										({prod.min_weight == prod.max_weight ? prod.min_weight : prod.min_weight +"-"+ prod.max_weight}{item.product.weight_unit})
									</span>
								:
									''
							}
						</p>
					</div>
					<div className="quantity">
						<div className="mobile_shim"></div>
						<div>
							<button id="decrement" className="dec" onClick={this.updateItemCount.bind(this, item, false)}></button>
							<div className="item-count">{item.quantity}</div>
							<button id="increment" className={item.quantity === 50 ? 'inc disabled' : 'inc'} onClick={this.updateItemCount.bind(this, item, true)}></button>
							<p className="price">&pound;{(prod.max_price == prod.min_price) ? (prod.max_price * this.props.item.quantity).toFixed(2) : (prod.min_price * this.props.item.quantity).toFixed(2) + ' - £' + (prod.max_price * this.props.item.quantity).toFixed(2)}</p>
							{this.state.exceededMaxQuantity &&
								<p className="max-quantity">Maximum quantity is 50</p>
							}
							{this.state.isOutOfStock &&
								<p className="is-out-of-stock">No more stock available</p>
							}
						</div>
					</div>
				</li>
	}
}

export default Basket;
