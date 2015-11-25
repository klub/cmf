'use strict';

import React from 'react';
import Request from '../../../../node_modules/superagent/lib/client';
import q from '../../../../node_modules/q/q';
import ApiService from '../../services/ApiService';
import {cursors, shoppingCart} from '../../services/ShoppingCart'

//ajax loader on page load
//error states
//payment cancel button

var sbXmasBasketId = sessionStorage.getItem('sbXmasBasketId');

class SkuOption extends React.Component {

    constructor() {
        super();
        this.selectWeight = this.selectWeight.bind(this);
    }

    static storeSelection(category, parentSku, sku, minPrice, maxPrice){
        sessionStorage.setItem('plp-sku-' + parentSku, category + '-' +  parentSku + '-' +  sku + '-' + minPrice + '-' + maxPrice);
    }

    selectWeight(e){
        if(this.select.className.indexOf('single') !== -1) return;

        SkuOption.storeSelection(this.category, this.parentSku, this.sku, this.minPrice, this.maxPrice);

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
            if(this.product.querySelector('.itemTypicalPrice')) {
                this.typicalPricePlaceholder.innerHTML = this.typicalPrice;
                this.pricePerKgPlaceholder.innerHTML = this.pricePerKg;
            }
        } else {
            this.select.className += ' open';
            for(var i = 0, j = this.lis.length; i < j; i++){
                this.lis[i].className += ' selected';
            }
        }
    }

    renderStoredValues () {
        var key, lsArray;

        for (let i = 0, j = sessionStorage.length; i < j; i++) {
            key = sessionStorage.key(i);
            if (key.indexOf('plp-sku') !== -1) {
                lsArray = sessionStorage.getItem(key).split('-');

                if (this.category === lsArray[0] && this.parentSku === lsArray[1] && this.sku === lsArray[2]) {
                    for (let k = 0, l = this.lis.length; k < l; k++) {
                        this.lis[k].className = this.lis[k].className.indexOf('disabled') !== -1 ? 'disabled' : '';
                    }
                    this.li.className += ' selected';
                    this.rangeMin.innerHTML = this.minPrice;
                    this.rangeMax.innerHTML = this.maxPrice;
                    this.button.setAttribute('data-product-item', lsArray[2]);
                    if(this.product.querySelector('.itemTypicalPrice')){
                        this.typicalPricePlaceholder.innerHTML = this.typicalPrice;
                        this.pricePerKgPlaceholder.innerHTML = this.pricePerKg;
                    }
                }
            }
        }
    }

    componentDidMount() {
        this.product = React.findDOMNode(this.props.productTile);
        this.select = this.product.getElementsByTagName('ul')[0];
        this.lis = this.select.getElementsByTagName('li');
        this.li = React.findDOMNode(this.refs.listItem);
        this.category = this.li.getAttribute('data-category');
        this.parentSku = this.li.getAttribute('data-product');
        this.sku = this.li.getAttribute('data-product-item');
        this.minPrice = this.li.getAttribute('data-minprice');
        this.maxPrice = this.li.getAttribute('data-maxprice');
        if (this.product.querySelector('.itemTypicalPrice')){
            this.typicalPrice = this.li.getAttribute('data-typicalprice');
            this.typicalPricePlaceholder = this.product.querySelector('.itemTypicalPrice');
            this.pricePerKg = this.li.getAttribute('data-priceperkg');
            this.pricePerKgPlaceholder = this.product.querySelector('.itemPricePerKg');
        }
        this.rangeMin = this.product.querySelectorAll('.range')[0];
        this.rangeMax =  this.product.querySelectorAll('.range')[1];
        this.button = this.product.getElementsByTagName('button')[0];
        this.renderStoredValues();
    }

    render(){
        return <li ref="listItem" onClick={this.selectWeight.bind(this)} data-category={this.props.productData.category.name} data-product={this.props.productData.sku} data-typicalprice={this.props.skudata.typical_price} data-priceperkg={this.props.skudata.price_per_kg}  data-product-item={this.props.skudata.sku} data-minprice={this.props.skudata.min_price} data-maxprice={this.props.skudata.max_price} className={!this.props.skudata.in_stock ? 'selected disabled' : 'selected'}>{this.props.skudata.min_weight} - {this.props.skudata.max_weight}kg <span className="serves">(serves {this.props.skudata.serves_min}-{this.props.skudata.serves_max})</span><span className="selector"></span></li>;
    }
}

class Product extends React.Component {


    constructor() {
        super();
        this.addToBasket = this.addToBasket.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.apiService = new ApiService();
        this.state = {
            loading : false,
            exceededMaxQuantity : false,
            isOutOfStock : false,
            allOutOfStock : true
        };
        this.productPage = symfonyConfig.symfonyEnvironment + '/product';
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

    storeBasketId(response){
        var newBasket = JSON.parse(response);
        sessionStorage.setItem('sbXmasBasketId', newBasket.id);
    }

    checkSkuAlreadyAdded(target){
        var skusAdded = target.getAttribute('data-skus-added'),
            currSelectedSku = target.getAttribute('data-product-item'),
            aSkusAdded = skusAdded.split(','),
            outOfStockSkus = target.getAttribute('data-out-of-stock').split(','),
            skuInArray = aSkusAdded.indexOf(currSelectedSku);

        if(outOfStockSkus.indexOf(currSelectedSku) === -1) {
            aSkusAdded.push(currSelectedSku);
        }

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
            loading:true
        });

        var target = e.target, updatedItem, skuAlreadyAdded = false, item,
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
                        loading:false
                    });

                    // Analytics
                    digitalData.event.push({'eventInfo':{
                        'eventName': 'updateQuantity',
                        'type' : 'standard',
                        'productSKU' : item.product.sku,
                        'quantity' : item.quantity,
                        'typicalPrice': item.typical_price,
                        'minPrice': item.min_price,
                        'maxPrice': item.max_price,
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
                        loading:false
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
                        this.addItemToBaobab(target, response, true);

                        this.setState({
                            loading:false
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
            )
        }
    }

    componentDidMount (){

        var product = this.props.data;

         for (var i=0; i<product.skus.length; i++){
            if (product.skus[i].in_stock){
                this.setState({
                    allOutOfStock : false
                })
            }
        }
    }

    render () {

        var product = this.props.data,
            objPath = this.props.data.components[0],
            imgPath = '../../../../../compiled/assets/img/icons/';


        if(window.innerWidth < 450){
          product.long_name = product.long_name.substring(0,48) + "..."
        }


        return <li data-parent-sku={product.sku}>
                    <a href={this.productPage + '/' + product.sku + '/' + product.slug}><img className="product" src={'/images/products/' + product.sku + '_tile.jpg'}/></a>
                    <h3><a href={this.productPage + '/' + product.sku + '/' + product.slug} className="product-name" dangerouslySetInnerHTML={{__html: product.long_name }}></a></h3>
                    {product.skus[0].min_price !== product.skus[0].max_price && product.skus.length == 1 && <img className="icon spacer" src="../../../../../compiled/assets/img/icons/spacer.png" alt="" />}

                    {objPath.british_beef && <img className="icon" src={imgPath + 'icon_british_beef.png'} alt="Beef" title="Beef" />}
                    {objPath.british_chicken_pork && <img className="icon" src={imgPath + 'icon_british_chicken_&_pork.png'} alt="Chicken &amp; Pork" title="Chicken &amp; Pork" />}
                    {objPath.british_chicken && <img className="icon" src={imgPath + 'icon_british_chicken.png'} alt="Chicken" title="Chicken" />}
                    {objPath.british_duck_pork && <img className="icon" src={imgPath + 'icon_british_duck_&_pork.png'} alt="Duck &amp; Pork" title="Duck &amp; Pork" />}
                    {objPath.british_parsnips && <img className="icon" src={imgPath + 'icon_british_parsnips.png'} alt="Parsnips" title="Parsnips" />}
                    {objPath.british_pork && <img className="icon" src={imgPath + 'icon_british_pork.png'} alt="Pork" title="Pork" />}
                    {objPath.british_potatoes && <img className="icon" src={imgPath + 'icon_british_potatoes.png'} alt="Potatoes" title="Potatoes" />}
                    {objPath.british_quail_pork && <img className="icon" src={imgPath + 'icon_british_quail_&_pork.png'} alt="Quail &amp; Pork" title="Quail &amp; Pork" />}
                    {objPath.scottish_salmon_scallops && <img className="icon" src={imgPath + 'icon_british_salmon_&_scallops.png'} alt="Salmon &amp; Scallops" title="Salmon &amp; Scallops" />}
                    {objPath.scottish_salmon && <img className="icon" src={imgPath + 'icon_british_salmon.png'} alt="Salmon" title="Salmon" />}
                    {objPath.scottish_scallops && <img className="icon" src={imgPath + 'icon_british_scallops.png'} alt="Scallops" title="Scallops" />}
                    {objPath.british_sprouts_pork && <img className="icon" src={imgPath + 'icon_british_sprouts_&_pork.png'} alt="Sprouts &amp; Pork" title="Sprouts &amp; Pork" />}
                    {objPath.british_turkey_pork && <img className="icon" src={imgPath + 'icon_british_turkey_&_pork.png'} alt="Turkey &amp; Pork" title="Turkey &amp; Pork" />}
                    {objPath.british_turkey_duck_pork && <img className="icon" src={imgPath + 'icon_british_turkey_duck_&_pork.png'} alt="Turkey, Duck &amp; Pork" title="Turkey, Duck &amp; Pork" />}
                    {objPath.british && <img className="icon" src={imgPath + 'icon_british.png'} alt="British" title="British" />}
                    {objPath.freezeable && <img className="icon" src={imgPath + 'icon_freezeable.png'} alt="Freezeable" title="Freezeable" />}
                    {objPath.french_guinea_fowl && <img className="icon" src={imgPath + 'icon_french_guinea_fowl.png'} alt="French Guinea Fowl" title="French Guinea Fowl" />}
                    {objPath.gluten_free && <img className="icon" src={imgPath + 'icon_gluten_free-19.png'} alt="Gluten Free" title="Gluten Free" />}
                    {objPath.vegetarian && <img className="icon" src={imgPath + 'icon_gluten_free-24.png'} alt="Vegetarian" title="Vegetarian" />}
                    {objPath.italian_pork && <img className="icon" src={imgPath + 'icon_italian_pork.png'} alt="Italian Pork" title="Italian Pork" />}
                    {objPath.pgo && <img className="icon" src={imgPath + 'icon_pgo.png'} alt="Protected Geographical Indication" title="Protected Geographical Indication" />}
                    {objPath.freedom_foods && <img className="icon rspca" src={imgPath + 'icon_rspca_freedom_foods.png'} title="RSPCA Assured" alt="RSPCA Assured" />}
                    {objPath.welsh_lamb && <img className="icon" src={imgPath + 'icon_welsh_lamb_square.png'} alt="Welsh Lamb" title="Welsh Lamb" />}
                    {objPath.woodland_trust && <img className="icon woodlands-trust" src={imgPath + 'icon_woodlands_trust.png'} alt="Woodland Trust" title="Woodland Trust" />}

                    {product.skus[0].min_price !== product.skus[0].max_price ?

                    <div>
                        <p className="price-per">&pound;{Number(product.skus[0].price_per_kg).toFixed(2)}<span className="weight-unit"> / {product.skus[0].weight_units}</span></p>
                        <div className="select-container">
                            <ul className={product.skus.length === 1 ? 'select single' : 'select'}>
                                {product.skus.map(
                                    (sku) => {
                                        return <SkuOption key={sku.sku} ref="listItem" productTile={this} productData={product} skudata={sku}/>;
                                    }
                                )}
                            </ul>
                        </div>
                        <span className="grey">(&pound;</span>
                        <p className="range min-price">{(product.skus[0].min_price)}</p>
                        <span className="grey"> - </span>
                        <span className="grey">&pound;</span>
                        <p className="range max-price">{(product.skus[0].max_price)}</p>
                        <span className="grey">)</span>
                        <em className="tooltip-icon-grey" onClick={this.showTooltip}><div className="guide-price-message"><div className="triangle"></div><div className="triangle-inner"></div>This is an estimated price. The exact price will be calculated on the day of collection based on weight.</div></em>
                    </div>

                    : product.skus.length > 1 ?

                    <div>
                        <p className="price-per">&pound;<span className="itemTypicalPrice">{product.skus[0].typical_price}</span></p>
                        <p className="price-per serves">&pound;<span className="itemPricePerKg">{product.skus[0].price_per_kg}</span>/kg</p>
                        <p className="range min-price hide-price">{(product.skus[0].min_price)}</p>
                        <p className="range max-price hide-price">{(product.skus[0].max_price)}</p>
                        <div className="select-container">
                            <ul className={product.skus.length === 1 ? 'select single' : 'select'}>
                                {product.skus.map(
                                    (sku) => {
                                        return <SkuOption key={sku.sku} ref="listItem" productTile={this} productData={product} skudata={sku}/>;
                                    }
                                )}
                            </ul>
                        </div>
                    </div>

                    : product.skus[0].price_per_kg ?

                    <div>
                        <p className="price-per">&pound;{product.skus[0].typical_price}</p>
                        <p className="price-per serves">&pound;{Number(product.skus[0].price_per_kg).toFixed(2)}<span> /kg</span>&nbsp;<span>(serves&nbsp;{product.skus[0].serves_min == product.skus[0].serves_max ? product.skus[0].serves_min : product.skus[0].serves_min +"-"+ product.skus[0].serves_max })</span></p>
                    </div>

                    :

                    <p className="price-per">&pound;{product.skus[0].typical_price}</p>
                }

                <button id="addToBasket" onClick={this.addToBasket} disabled={this.state.loading || (product.skus.length > 1 && this.state.allOutOfStock) || (product.skus.length === 1 && !product.skus[0].in_stock) && 'disabled'} className="btn" data-category={product.category.name} data-product={product.sku} data-product-item={product.skus[0].sku} data-skus-added={this.props.previouslySelectedSkus} data-out-of-stock={this.props.outofstockSkus}>{(product.skus.length > 1 && this.allOutOfStock) || (product.skus.length === 1 && !product.skus[0].in_stock) ? 'Out of stock' : 'Add to trolley'}</button>
                <div className={this.state.isOutOfStock ? 'visible is-out-of-stock' : 'is-out-of-stock'}><em className="tooltip-icon black">i</em> Out of stock</div>
                <div className={this.state.exceededMaxQuantity ? 'visible exceeded-max-quantity' : 'exceeded-max-quantity'}><em className="tooltip-icon black">i</em>Maximum quantity is 50</div>
            </li>
        }
    }

class ProductList extends React.Component {

    constructor() {
        super();
        this.state = {
            products : [],
            previouslySelectedSkus : [],
            outOfStockSkus : []
        };
        this.apiService = new ApiService();
        this.timeout = 1800000;
    }

    componentDidMount(){

        cursors.basketItems.on('update', () => {
            this.getCachedProducts();
            this.getCategoryData();
        });

        this.getCachedProducts();
        this.getCategoryData();
    }

    getCachedProducts() {
        switch (this.props.category) {
            case 'sharing-food' :
                this.cachedProducts = sessionStorage.getItem('xmasSharingProducts');
                this.storageKey = 'xmasSharingProducts';
                break;
            case 'turkey-poultry-game' :
                this.cachedProducts = sessionStorage.getItem('xmasTurkeyProducts');
                this.storageKey = 'xmasTurkeyProducts';
                break;
            case 'roasts-mains' :
                this.cachedProducts = sessionStorage.getItem('xmasRoastsProducts');
                this.storageKey = 'xmasRoastsProducts';
                break;
            case 'accompaniments' :
                this.cachedProducts = sessionStorage.getItem('xmasAccompanimentsProducts');
                this.storageKey = 'xmasAccompanimentsProducts';
                break;
            case 'desserts-cheese' :
                this.cachedProducts = sessionStorage.getItem('xmasDessertsProducts');
                this.storageKey = 'xmasDessertsProducts';
                break;
            case 'floral' :
                this.cachedProducts = sessionStorage.getItem('xmasFloralProducts');
                this.storageKey = 'xmasFloralProducts';
                break;
        }
    }

    getCategoryData(){

        let elapsedTime = Date.now() - Number(sessionStorage.getItem('xmasProductsTimestamp'));

        if(this.cachedProducts){

            if(elapsedTime > this.timeout){
                this.apiService.getCategoryData(this.props.category).then(response => {
                        this.setCacheAndProducts(response.text);
                    }, error => {
                        console.log('An error occurred retrieving the product data.')
                    }
                );
            } else {
                this.renderProducts(this.cachedProducts);
            }

        } else {

            this.apiService.getCategoryData(this.props.category).then(response => {
                    this.setCacheAndProducts(response.text);
                }, error => {
                    console.log('An error occurred retrieving the product data.')
                }
            );
        }
    }

    setCacheAndProducts(products){
        let timestamp = Date.now();
        this.renderProducts(products);
        sessionStorage.setItem(this.storageKey, products);
        sessionStorage.setItem('xmasProductsTimestamp', timestamp);
    }

    renderProducts(products){
        if(sbXmasBasketId){
            this.renderProductsCategoryAndBasket(products);
        } else {
            this.renderProductsCategory(products);
        }
    }

    renderProductsCategory(products){
        var outOfStockSkus = [];

        this.setState({
            products: JSON.parse(products)
        });

        for (var i = 0, j = this.state.products.length; i < j; i++) {
            var skus = this.state.products[i].skus;
            for (var k = 0, l = skus.length; k < l; k++) {
                if (!skus[k].in_stock) {
                    outOfStockSkus.push(skus[k].sku)
                }
            }
        }

        this.setState({outOfStockSkus: outOfStockSkus = outOfStockSkus.join(',')})
    }

    renderProductsCategoryAndBasket(products){
        var previouslySelectedSkus = [],
            outOfStockSkus = [],
            aSkus;

        var basketItems = shoppingCart.getItems();

        for (var i = 0, j = basketItems.length; i < j; i++) {
            previouslySelectedSkus.push(basketItems[i].product.sku);
        }
        aSkus = previouslySelectedSkus.join(',');

        this.setState({
            products: JSON.parse(products),
            previouslySelectedSkus: aSkus
        });

        for (var i = 0, j = this.state.products.length; i < j; i++) {
            var skus = this.state.products[i].skus;
            for (var k = 0, l = skus.length; k < l; k++) {
                if (!skus[k].in_stock) {
                    outOfStockSkus.push(skus[k].sku)
                }
            }
        }

        this.setState({outOfStockSkus: outOfStockSkus = outOfStockSkus.join(',')})
    }

    render() {
        return (
            <div className="inner">
                <p className="product-count">{this.state.products.length} products</p>
                <ul id="product-list" className="product-list">
					{this.state.products.map(
                        (product) => {
                            return <Product key={product.sku} data={product} previouslySelectedSkus={this.state.previouslySelectedSkus} outofstockSkus={this.state.outOfStockSkus}/>;
                        }
                    )}
                </ul>
            </div>
        )
    }
}

export default ProductList;
