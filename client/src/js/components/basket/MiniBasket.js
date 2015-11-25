'use strict';

import React from 'react';
import ApiService from './../../services/ApiService.js';
import {cursors, shoppingCart} from './../../services/ShoppingCart.js';

var sbXmasBasketId = sessionStorage.getItem('sbXmasBasketId'),
	apiService = new ApiService(),
	timeoutId,
    ua = navigator.userAgent,
    isiPad = /iPad/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua),
    isiPhone = /iPhone/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua);

let MiniBasketLink = React.createClass({

	basketPage: symfonyConfig.symfonyEnvironment + '/basket',

	mouseOver () {
        if(isiPhone){
            window.location.href = '/basket';
        } else {
            this.props.basketDropdownDisplay(false, true);
        }
	},

	hideBasket (){

		var dropDown = document.querySelector('.basket_dropdown');
		if(dropDown.style.display == 'block'){
			dropDown.style.display = 'none';
		} else {
			dropDown.style.display = 'block';
		}
	},

	render () {
		return (
			<div className="mini-basket-link-container">
				<div className="mini-basket-link" onMouseOver={this.mouseOver}>

					{isiPad ?
						<div className='ipad-basket'>
							<button onClick={this.hideBasket}>Hide Basket</button>
							<span className='basket-img'>
								<img className="mini_basket_header_img" src="/compiled/assets/img/icons/trolley_icon.png" />
							</span>
							<span>
								My trolley
							</span>
							<span id="item-count" className="small_circle_icon_overlay basket_item_count">
								{this.props.items_count}
							</span>
						</div>
					:
						<a tabIndex="4" href={this.basketPage}>
							<span>
								<img className="mini_basket_header_img" src="/compiled/assets/img/icons/trolley_icon.png" />
							</span>
							<span>
								My trolley
							</span>
							<span id="item-count" className="small_circle_icon_overlay basket_item_count">
								{this.props.items_count}
							</span>
						</a>
					}
				</div>
				<div className="mini-basket-link-extension"></div>
			</div>
		);
	}
});

class CarouselItem extends React.Component {

	constructor () {
        super();
		this.state = {
			highlighted : false,
			flash  : false
		};
	}

	updateItemCount(item, increment, e){

		var obj = {
			sku : item.product.sku,
			increment : increment
		}
		this.updateItem(item, obj, increment);
		this.props.ipadShow();

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
		});
	}

	updateItem(item, obj, increment) {

		apiService.updateItem(sbXmasBasketId, obj, increment).then(response => {

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
				shoppingCart.updateItemQuantity(updatedItem, increment);

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
                }, delay)
            }
            if(error.out_of_stock){
                this.setState({isOutOfStock: true});
                setTimeout(() => {
                    document.querySelector('.is-out-of-stock').className = 'is-out-of-stock';
                    this.setState({isOutOfStock: false});
                }, delay)
            }
        }
    }

	render () {
			var item = this.props.item,
        	itemPrice = (item.product.max_price == item.product.min_price) ? (item.product.max_price * item.quantity).toFixed(2) : (item.product.min_price * item.quantity).toFixed(2) + ' - £' + (item.product.max_price * item.quantity).toFixed(2);

			var maxLength = 70;
			var desc = (item.product.name.length > maxLength) ? item.product.name.substring(0,maxLength) + "..." : item.product.name;

			return <li>
                        <div className="carosel_item_container">
                            <div className="image_container">
                                <div className="thumbnail_image">
																		<span className="price-icon">{item.quantity}</span>
                                    <img className="product" src={'/images/products/' + item.product.product_sku + '_tile.jpg'}/>
                                </div>
                            </div>

                            <div className="desc_container">
                                <h3 dangerouslySetInnerHTML={{__html: desc }}></h3>

                                {item.product.min_serves && item.product.max_serves ?
									<p className="serves">
										<b>Serves:</b> {item.product.min_serves == item.product.max_serves ? item.product.min_serves : item.product.min_serves +"-"+ item.product.max_serves}&nbsp;
										({item.product.min_weight == item.product.max_weight ? item.product.min_weight : item.product.min_weight +"-"+ item.product.max_weight}{item.product.weight_unit})
									</p>
									: ''
								}

                                {this.state.exceededMaxQuantity &&
                                    <p className="max-quantity">Maximum quantity is 50</p>
                                }
                                {this.state.isOutOfStock &&
                                    <p className="is-out-of-stock">No more stock available</p>
                                }
                                <p className="price_range">
                                    &pound;{itemPrice}
                                </p>
                            </div>
                        </div>
                    </li>
	}
};

class CarouselItems extends React.Component {
    render(){
        return (
            <ul className="carousel">
                {this.props.state.items.map(
                        item => {
                        return <CarouselItem key={item.id} item={item} ipadShow={this.props.ipadShow}/>;
                    }
                )}
            </ul>
        )
    }
}

let ItemsCarousel = React.createClass({

	'item_height':110,

	disableUpArrow () {
		let up_arrow = document.getElementById("up_arrow");
		up_arrow.className = up_arrow.className + " up_arrow_disabled";
	},

	disableBottomArrow () {
		let bottom_arrow = document.getElementById("bottom_arrow");
		bottom_arrow.className = bottom_arrow.className + " bottom_arrow_disabled";
	},

	moveCarousel (event) {
		event.preventDefault();
		let li_num = this.props.state.items.length;
		let ul_style_top = (document.querySelector('div.carousel_container > ul').style.top).replace(/[^-\d\.]/g, '');
		let li_height = this.item_height;

		// move carousel up if first item is not showing
        if (event.target.id === "up_arrow" && (ul_style_top !== '' && ul_style_top < 0 && ul_style_top !== '0px')){
			document.querySelector('div.carousel_container > ul').style.top = (+ul_style_top + li_height) + 'px';
		}

		// move carousel down if bottom item is not showing
        if (event.target.id === "bottom_arrow" && (((-li_num * li_height) + (li_height * this.visible_items)) < ul_style_top)){
			document.querySelector('div.carousel_container > ul').style.top = (+ul_style_top - li_height) + 'px';
		}

		let new_ul_style_top = (document.querySelector('div.carousel_container > ul').style.top).replace(/[^-\d\.]/g, '');

		// make sure neither arrow is disabled
		document.getElementById("up_arrow").className = "up_arrow";
		document.getElementById("bottom_arrow").className = "bottom_arrow";

		// disable top arrow if first item showing
		if (new_ul_style_top === '' || new_ul_style_top >= 0){
			this.disableUpArrow();
		}

		// disable bottom arrow if bottom item showing
		if (new_ul_style_top <= ((-li_num * li_height) + (li_height * this.visible_items))){
			this.disableBottomArrow();
		}

	},

	componentDidMount () {

		this.visible_items = 2

		// required for css transitions to work on first click of bottom arrow link
		document.querySelector('div.carousel_container > ul').style.top='0px';

		// disable bottom arrow if number of items in basket is <= visible_items
		if (this.props.state.items.length <= this.visible_items){
			this.disableBottomArrow();
		}
	},

	componentWillReceiveProps (nextProps) {

		// Highlights and displays flashed updated product
		if(nextProps.state.highlighted > 0){

			var list = document.querySelector('.carousel_container > ul');

			if(nextProps.state.items.length == (nextProps.state.highlighted + 1) && this.visible_items == 2){
				list.setAttribute('style',  "top:-" + (this.item_height * (nextProps.state.highlighted - 1) + "px"));
			} else {
				list.setAttribute('style',  "top:-" + (this.item_height * nextProps.state.highlighted + "px"));
			}
		}

		// updates top and bottom carousel arrows when basket is updated

		// make sure neither arrow is disabled
		document.getElementById("up_arrow").className = "up_arrow";
		document.getElementById("bottom_arrow").className = "bottom_arrow";

		let ul_style_top = (document.querySelector('.carousel_container > ul').style.top).replace(/[^-\d\.]/g, '');
		let li_num = nextProps.state.items.length;
		let li_height = this.item_height;

		// disable top arrow if first item showing
		if (ul_style_top === '' || ul_style_top >= 0){
			this.disableUpArrow();
		}

		// disable bottom arrow if bottom item showing
		if (ul_style_top <= ((-li_num * li_height) + (li_height * this.visible_items))){
			this.disableBottomArrow();
		}
	},

	render () {
		return (

			<div>
				<div className="arrow_container">
					<a href="#" id="up_arrow" className='up_arrow up_arrow_disabled' onClick={this.moveCarousel}></a>
				</div>


				<div className="carousel_container" style={this.props.state.items.length == 1 ? {height: this.item_height + 'px'} : this.props.state.items.length === 0 ? {height:'259px'} : {height: (this.item_height * this.visible_items) + 'px'}}>
					<div className="carousel_container_top_border"></div>
					{this.props.state.items.length == 0 ?
						<div className="empty_basket">
							<p className="bahumbug_text">
								Bah humbug! Your trolley is empty
							</p>

							<img className="bahumbug_image" src="../../../../../compiled/assets/img/large-trolley.png" alt="empty shopping trolley" />
						</div>
					: ''}

					<CarouselItems state={this.props.state} ipadShow={this.props.ipadShow}/>

				</div>
				<div className="arrow_container bottom_arrow_container">
					<a href="#" id="bottom_arrow" className="bottom_arrow" onClick={this.moveCarousel}></a>
				</div>
			</div>
		);
	}
});

let MiniBasketDropdown = React.createClass({

	basketPage: symfonyConfig.symfonyEnvironment + '/basket',

	getInitialState () {
		return {
			incremented : false
		};
	},

    componentDidMount () {
        this.setState({disabled : true});
    },

	componentWillReceiveProps (nextProps) {

		nextProps.state.estimatedTotal = 0;

		nextProps.state.items.map(
				item => {
				if (item.in_stock) {
					nextProps.state.estimatedTotal += (item.product.typical_price * item.quantity);
				}
			}
		);

        this.state.incremented  = nextProps.state.estimatedTotal > this.props.state.estimatedTotal;
        this.state.disabled  = nextProps.state.estimatedTotal < 10;
	},

	render () {
		return (
			<div className={this.props.state.newItemAdded ? 'new-item basket_dropdown' : 'basket_dropdown'}
				 style={this.props.state.showBasket ? {display:'block'} : {display:'none'}}>

				{this.props.state.newItemAdded ?

					 <h2>
						<div className="tick"></div>
						<div className="added-to-trolley">
							{this.props.state.itemAdded ? 'Added to trolley' : 'Removed from trolley'}
						</div>
					</h2>
				:
					<h2>My trolley</h2>
				}

				<ItemsCarousel state={this.props.state} ipadShow={this.props.ipadShow}/>

				<div className="estimated_total mary-ann">
					<span className="estimate_text">
						Estimated total:
					</span>

					<span className="estimate_price">
						&pound;{this.props.state.estimatedTotal.toFixed(2)}&#42;
					</span>
				</div>


                <form method="post" action={this.basketPage}>

                    <button className="btn mini_basket_view_trolley" disabled={this.state.disabled}>View Trolley</button>
                </form>

                {this.props.state.items.length > 0 ?
					<div className="min_spend_notice_container">
						<em className="tooltip-icon black">i</em>
	                    {this.state.disabled ? 'Please note that there is a minimum spend of £10 for Christmas pre-orders. The deposit secures your order. You\'ll receive your £10 back when you collect your order.' : '*This is an estimate total based on the typical price of the product. The final price is calculated by weight which is marked on the product on day of collection. If you decide to cancel your order, you will receive your deposit back as long as you cancel by the 15th December.'}
					</div>
				: '' }
			</div>
		);
	}
});

let MobileNewItemNotification = React.createClass({


	componentWillReceiveProps (nextProps) {

		if (nextProps.state.newItemAdded  && nextProps.state.showBasket){

			document.getElementById("mobile-new-item-added-notification").style.opacity=1;
			document.getElementById("mobile-new-item-added-notification").style.zIndex=200;

			setTimeout( () => {

				document.getElementById("mobile-new-item-added-notification").style.opacity=0;
				document.getElementById("mobile-new-item-added-notification").style.zIndex=-5;

			}, 3000);
		}
	},

	render () {
		return (

			<div id="mobile-new-item-added-notification" className="mobile-new-item-added-notification">
				<div className="tick"></div>
				<div className="added-to-trolley">
					Added to trolley
				</div>
			</div>
		);
	}
});


let MiniBasket = React.createClass({

	getInitialState () {

		return {
			itemCount : null,
			items: [],
			currentCount : 0,
			highlighted : false,
			estimatedTotal : 0,
			newItemAdded: false,
			showBasket: false,
			itemAdded: false,
			increment : false
		};
	},

	componentWillMount() {
		var parsedBasket;
		if(sbXmasBasketId){
			apiService.getBasketData(sbXmasBasketId).then(response => {
				parsedBasket = JSON.parse(response.text);
				this.buildBaobab(parsedBasket);
			},
			error => {
				sessionStorage.removeItem('sbXmasBasketId');
			})
		} else {
			console.log('cannot get basket');
		}
	},

	componentDidMount () {
		var itemTally;

		cursors.basketItems.on('update', () => {

			sbXmasBasketId = sessionStorage.getItem('sbXmasBasketId');
			itemTally = 0;

			this.setState({
				items: shoppingCart.getItems()
			});

			this.state.items.filter(item => {
				itemTally += item.in_stock ? item.quantity : 0;
				return itemTally;
			});

			if (sessionStorage.getItem('itemTally') != itemTally){
				this.setState({
					showBasket : (!isiPad || (isiPad && this.state.increment))? true : false,
					highlighted : cursors.flash,
					newItemAdded : true,
					estimatedTotal : 0
				});

				if (sessionStorage.getItem('itemTally') < itemTally){
					this.setState({
						itemAdded: true
					});
				} else {
					this.setState({
						itemAdded: false
					});
				}
			}

			sessionStorage.setItem('itemTally', itemTally);

			document.getElementById('item-count').innerHTML = itemTally;

			// only set timeout if device is not ipad.
			if(!isiPad){
				this.timeoutId = setTimeout(() => {
					this.basketDropdownDisplay(false, false);
				}, 3000);

			}

		});

	},

	buildBaobab(basket){
		for(var i = 0, j = basket.basket_items.length; i < j; i++) {
			shoppingCart.addItem(basket.basket_items[i]);
		}

		// add slot to Baobab
		shoppingCart.addSlot(basket.slot);
	},

	basketDropdownDisplay (newItemAdded, showBasket, items) {

		// open basket with first item showing
		document.querySelector('div.carousel_container > ul').style.top='0px';

		this.setState({
			newItemAdded: newItemAdded,
			showBasket: showBasket,
			highlighted : false,
			items: items || this.state.items
		});
	},

	mouseOver () {
		clearTimeout(this.timeoutId);
	},

	mouseLeave () {

		if(!isiPad){
			this.basketDropdownDisplay(false, false);
		}
	},

	ipadShow (){
		this.setState({
			increment : true
		})
	},

	render () {
		return (
			<div onMouseLeave={this.mouseLeave} onMouseOver={this.mouseOver}>
				<MiniBasketLink basketDropdownDisplay={this.basketDropdownDisplay} items_count={this.state.items.length} />
				<MiniBasketDropdown state={this.state} ipadShow={this.ipadShow} />
				<MobileNewItemNotification state={this.state} />
			</div>
		);
	}
});

export default MiniBasket;
