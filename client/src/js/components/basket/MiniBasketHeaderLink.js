'use strict';

import React from 'react';
import {cursors, shoppingCart} from './../../services/ShoppingCart.js';

class MiniBasketHeaderLink extends React.Component {

    constructor(){
        super();
        this.basketPage = symfonyConfig.symfonyEnvironment + '/basket';
        this.state = {
            itemTally : 0
        }
    }

    componentDidMount () {

        cursors.basketItems.on('update', () => {
            var items = shoppingCart.getItems(), itemTally = 0;

            items.filter(item => {
                itemTally += item.in_stock ? item.quantity : 0;
                return itemTally;
            });

            this.setState({
                itemTally : itemTally
            })
        });
    }

    render () {
        return (
            <div className="mini-basket-link-container">
                <div className="mini-basket-link">
                    <a href={this.basketPage}>
                        <span>
                            <img className="mini_basket_header_img" src="/compiled/assets/img/icons/trolley_icon.png" />
                        </span>
                        <span>
                            My trolley
                        </span>
                        <span id="item-count" className="small_circle_icon_overlay basket_item_count" dangerouslySetInnerHTML={{__html: this.state.itemTally }}></span>
                    </a>
                </div>
            </div>
        );
    }
};

export default MiniBasketHeaderLink;