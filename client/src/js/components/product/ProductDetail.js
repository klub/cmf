'use strict';

import React from 'react';
import Request from '../../../../node_modules/superagent/lib/client';
import q from '../../../../node_modules/q/q';
import ApiService from '../../services/ApiService';
import {cursors, shoppingCart} from '../../services/ShoppingCart'

var sbXmasBasketId = sessionStorage.getItem('sbXmasBasketId');

class Sku extends React.Component {

	constructor() {
		super();
		this.state = {};
        this.itemCode = document.querySelectorAll('.item-code');
	}

    static storeSelection(category, parentSku, sku, minPrice, maxPrice){
        sessionStorage.setItem('plp-sku-' + parentSku, category + '-' +  parentSku + '-' +  sku + '-' + minPrice + '-' + maxPrice);
    }

	selectWeight(e){
		if(this.select.className.indexOf('single') !== -1) return;

		Sku.storeSelection(this.category, this.parentSku, this.sku, this.minPrice, this.maxPrice);

        if(this.select.className.indexOf('open') !== -1){
			this.select.className = 'select';

			for(var i = 0, j = this.lis.length; i < j; i++){
				this.lis[i].className = this.lis[i].className.indexOf('disabled') !== -1 ?  'disabled' : '';
			}

			this.li.className += ' selected';
			this.button.setAttribute('data-category', this.category);
			this.button.setAttribute('data-product', this.parentSku);
			this.button.setAttribute('data-product-item', this.sku);
			this.rangeMin.innerHTML = this.minPrice;
			this.rangeMax.innerHTML = this.maxPrice;
            if(this.product.querySelector('.itemPricePerKg')) {
                this.pricePerKgPlaceholder.innerHTML = this.pricePerKg;
            }
            this.showItemCode();
		} else {
			this.select.className += ' open';
			for(var i = 0, j = this.lis.length; i < j; i++){
				this.lis[i].className += ' selected';
			}
		}
	}

    showItemCode(sku){
        var id = sku || this.sku;
        for(var i = 0, j = this.itemCode.length; i < j; i++){
            this.itemCode[i].className = 'item-code';
        }
        document.getElementById(id).className += ' visible';
    }

	renderStoredValues() {
		var key, lsArray;

		for (let i = 0, j = sessionStorage.length; i < j; i++) {
			key = sessionStorage.key(i);
			if (key.indexOf('plp-sku') !== -1) {
				lsArray = sessionStorage.getItem(key).split('-');

				if (this.category === lsArray[0] && this.parentSku === lsArray[1] && this.sku === lsArray[2]) {
					for (let k = 0, l = this.lis.length; k < l; k++) {
						this.lis[k].className = this.lis[k].className.indexOf('disabled') !== -1 ?  'disabled' : '';
					}
                    this.li.className += ' selected';
					this.rangeMin.innerHTML = this.minPrice;
					this.rangeMax.innerHTML = this.maxPrice;
                    if(this.product.querySelector('.itemPricePerKg')) {
                        this.pricePerKgPlaceholder.innerHTML = this.pricePerKg;
                    }
					this.button.setAttribute('data-product-item', lsArray[2]);
                    this.showItemCode(this.sku);
				}
			}
		}
	}

	componentDidMount(){
		this.li = React.findDOMNode(this.refs.listItem);
        this.select = this.li.parentNode;
        this.product = this.select.parentNode.parentNode.parentNode;
        this.lis = this.select.getElementsByTagName('li');
        this.category = this.li.getAttribute('data-category');
		this.parentSku = this.li.getAttribute('data-product');
		this.sku = this.li.getAttribute('data-product-item');
		this.minPrice = this.li.getAttribute('data-minprice');
		this.maxPrice = this.li.getAttribute('data-maxprice');
        if(this.product.querySelector('.itemPricePerKg')) {
            this.pricePerKg = this.li.getAttribute('data-priceperkg');
            this.pricePerKgPlaceholder = this.product.querySelector('.itemPricePerKg');
        }
		this.rangeMin = this.product.querySelectorAll('.range')[0];
		this.rangeMax =  this.product.querySelectorAll('.range')[1];
		this.button = this.product.getElementsByTagName('button')[0];
		this.renderStoredValues();
	}

	render() {
		return <li ref="listItem" onClick={this.selectWeight.bind(this)} data-category={this.props.product.category.name} data-product={this.props.product.sku} data-product-item={this.props.sku.sku} data-priceperkg={this.props.sku.price_per_kg} data-minprice={this.props.sku.min_price} data-maxprice={this.props.sku.max_price} className={!this.props.sku.in_stock ? 'selected disabled' : 'selected'}>{this.props.sku.min_weight == this.props.sku.max_weight ? this.props.sku.min_weight : this.props.sku.min_weight +"-"+ this.props.sku.max_weight}kg <span className="serves">(serves {this.props.sku.serves_min}-{this.props.sku.serves_max})</span><span className="selector"></span></li>
	}
}

class ProductDetail extends React.Component {

	constructor() {
		super();
        this.addToBasket = this.addToBasket.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.apiService = new ApiService();
        this.state = {
				    loading : false,
			      product : {},
			      skus : [],
            exceededMaxQuantity : false,
            isOutOfStock : false,
            allOutOfStock : true
		};
	}

    componentDidMount(){
        cursors.basketItems.on('update', () => {
            this.getData();
        });

        this.getData();
    }

    showTooltip(e){
        var msg = e.target.childNodes[0];

        if(msg.className.indexOf('hover') === -1){
            msg.className = 'guide-price-message hover';
        } else {
            msg.className = 'guide-price-message';
        }
        setTimeout(()=>{
            msg.className = 'guide-price-message';
        }, 5000);
    }

    getData(){
        if(sbXmasBasketId){
            this.getProductAndBasketData(this.props.parentsku);
        } else {
            this.getProductData(this.props.parentsku);
        }
    }

    getProductData(parentSku){
        this.apiService.getProductData(parentSku).then(response => {
                this.setState({
                    product: JSON.parse(response.text),
                    skus: JSON.parse(response.text).skus
                });
                document.getElementById('add-to-trolley').className += ' visible';
            }
        )
    }

    getProductAndBasketData(parentSku){
        var previouslySelectedSkus = [],
            aSkus;

        this.apiService.getProductData(parentSku).then(response => {
            var basketItems = shoppingCart.getItems();

            for(var i = 0, j = basketItems.length; i < j; i++){
                previouslySelectedSkus.push(basketItems[i].product.sku);
            }
            aSkus = previouslySelectedSkus.join(',');

            this.setState({
                product : JSON.parse(response.text),
                skus: JSON.parse(response.text).skus,
                previouslySelectedSkus : aSkus
            });

            document.getElementById('add-to-trolley').className += ' visible';
        }, error => {
            console.log('An error occurred retrieving the product data.')
        });
    }


    storeBasketId(response){
        var newBasket = JSON.parse(response);
        sessionStorage.setItem('sbXmasBasketId', newBasket.id);
    }

    checkSkuAlreadyAdded(target){

        var skusAdded = target.getAttribute('data-skus-added'),
            currSelectedSku = target.getAttribute('data-product-item'),
            aSkusAdded = skusAdded.split(','),
            skuInArray = aSkusAdded.indexOf(currSelectedSku);

        aSkusAdded.push(currSelectedSku);
        target.setAttribute('data-skus-added', aSkusAdded);

        return skuInArray !== -1;
    }

    addItemToBaobab(target, response, dataSkus){
        var newItem = JSON.parse(response.text);
        shoppingCart.addItem(newItem);
        if(!dataSkus) return;
        target.setAttribute('data-skus-added', newItem.product.sku);
    }

    showMessage(err){
        var error = JSON.parse(err.response.text),
            delay = 3000;

        if(err.status === 400){
            if(error.maximum_quantity){
                this.setState({exceededMaxQuantity: true});
                setTimeout(() => {
                    document.querySelector('.exceeded-max-quantity').className = 'exceeded-max-quantity';
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

    addToBasket(e){


				this.setState({
				    loading : true
				});

        var target = e.target, updatedItem, skuAlreadyAdded = false, item,
            delay = 3000,
            obj = {
                sku : target.getAttribute('data-product-item'),
                quantity : 1,
                increment : true
            };

        if(sbXmasBasketId){
            skuAlreadyAdded = this.checkSkuAlreadyAdded(target);

            if(skuAlreadyAdded){
                this.apiService.updateItem(sbXmasBasketId, obj).then(response => {
                    updatedItem = JSON.parse(response.text);
                    shoppingCart.updateItemQuantity(updatedItem,true);

										this.setState({
										    loading : false
										});

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
                }, err => {
                    if(err.status === 404){
                        this.apiService.addItem(sbXmasBasketId, obj).then(response => {
                            this.addItemToBaobab(target, response, false);
                        }, err => {
                            this.showMessage(err);
                        })
                    } else {
                        this.showMessage(err);
                    }

                    this.setState({
                        loading:false
                    });
                })
            } else {
                this.apiService.addItem(sbXmasBasketId, obj).then(response => {
                    this.addItemToBaobab(target, response, false);

										this.setState({
										    loading : false
										});

                    // Analytics
                    item = JSON.parse(response.text);
                    digitalData.event.push({'eventInfo':{
                        'eventName': 'addToBasket',
                        'type' : 'standard',
                        'productSKU' : item.product.sku,
                        'quantity' : item.quantity,
                        'typicalPrice': item.typical_price,
                        'minPrice': item.min_price,
                        'maxPrice': item.max_price,
                        'mode' : 'new'
                    }});
                }, err => {
                    this.showMessage(err);

                    this.setState({
                        loading:false
                    });
                })
            }
        } else {
            this.apiService.createBasket().then(response => {

                this.storeBasketId(response.text);
            }).then(() => {
                    sbXmasBasketId = sessionStorage.getItem('sbXmasBasketId');

                    this.apiService.addItem(sbXmasBasketId, obj).then(response => {

												this.setState({
												  	loading : false
												});
												
                        this.addItemToBaobab(target, response, true);
                    }, err => {
                        this.showMessage(err);

                        this.setState({
                        loading:false
                    });
                    })
                }
            )
        }
    }

	render() {

		return (
			<div>
                {this.state.product.product &&
                    <div>
                        <h1 dangerouslySetInnerHTML={{__html: this.state.product.product.long_name }}></h1>

                        {this.state.product.product.skus.length > 1 ?
                            <div>
								{this.state.product.product.skus[0].min_price === this.state.product.product.skus[0].max_price ?
									<div>
										<p className="price-per">&pound;<span className="range">{this.state.product.product.skus[0].typical_price}</span></p>
										<p>&pound;<span className="itemPricePerKg">{this.state.product.product.skus[0].price_per_kg}</span> <span className="weight-unit"> / {this.state.product.product.skus[0].weight_units}</span></p>
									</div>
								:
									<p className="price-per">&pound;{Number(this.state.product.product.skus[0].price_per_kg).toFixed(2)}<span className="weight-unit"> / {this.state.product.product.skus[0].weight_units}</span></p>
								}
                                <div className="select-container">
                                    <ul className={this.state.product.product.skus.length === 1 ? 'select single' : 'select'}>
                                            {this.state.skus.map(
                                                (sku) => {
                                                    if(sku.in_stock) this.state.allOutOfStock = false;
                                                    return <Sku key={sku.sku} product={this.state.product.product} select={this} sku={sku}/>;
                                                }
                                            )}
                                    </ul>
                                </div>
                                <div className={this.state.product.product.skus[0].min_price === this.state.product.product.skus[0].max_price ? 'clearfix hide-price' : 'clearfix'}>
                                    <span className="grey">(&pound;</span>
                                    <p className="range min-price">{(this.state.product.product.skus[0].min_price)}</p>
                                    <span className="grey"> - </span>
                                    <span className="grey">&pound;</span>
                                    <p className="range max-price">{(this.state.product.product.skus[0].max_price)}</p>
                                    <span className="grey">)</span>
                                    <em className="tooltip-icon-grey" onClick={this.showTooltip}><div className="guide-price-message"><div className="triangle"></div><div className="triangle-inner"></div>This is an estimated price. The exact price will be calculated on the day of collection based on weight.</div></em>
                                </div>
                            </div>

                        : this.state.product.product.skus[0].price_per_kg ?

                            <div>
                                <p className="price-per">&pound;{this.state.product.product.skus[0].min_price !== this.state.product.product.skus[0].max_price ? this.state.product.product.skus[0].min_price + ' - £' + this.state.product.product.skus[0].max_price: this.state.product.product.skus[0].typical_price}</p>
                                <p className="price-per serves">&pound;{Number(this.state.product.product.skus[0].price_per_kg).toFixed(2)}<span> / kg</span>&nbsp;<span>(serves&nbsp;
                                    {this.state.product.product.skus[0].serves_min == this.state.product.product.skus[0].serves_max ? this.state.product.product.skus[0].serves_min : this.state.product.product.skus[0].serves_min +"-"+ this.state.product.product.skus[0].serves_max }
                                )</span></p>
                            </div>

                        :

                            <p className="price-per">&pound;{this.state.product.product.skus[0].typical_price}</p>
                        }

                        <button id="productAddToBasket" onClick={this.addToBasket} disabled={this.state.loading || (this.state.product.product.skus.length > 1 && this.state.allOutOfStock) || (this.state.product.product.skus.length === 1 && !this.state.product.product.skus[0].in_stock) && 'disabled'} data-skus-added={this.state.previouslySelectedSkus} className="btn" data-category={this.state.product.product.category.name} data-product={this.state.product.product.sku} data-product-item={this.state.product.product.skus[0].sku}>{(this.state.product.product.skus.length > 1 && this.state.allOutOfStock) || (this.state.product.product.skus.length === 1 && !this.state.product.product.skus[0].in_stock) ? 'Out of stock' : 'Add to trolley'}</button>
                        <div className={this.state.isOutOfStock ? 'visible is-out-of-stock' : 'is-out-of-stock'}><em className="tooltip-icon black">i</em> Out of stock</div>
                        <div className={this.state.exceededMaxQuantity ? 'visible exceeded-max-quantity' : 'exceeded-max-quantity'}><em className="tooltip-icon black">i</em>Maximum quantity is 50</div>

                    </div>
                }
			</div>
		)
	}
}

export default ProductDetail;
