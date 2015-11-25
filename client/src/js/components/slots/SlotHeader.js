'use strict';

import React from 'react';
import {cursors, shoppingCart} from './../../services/ShoppingCart.js';

let SlotHeader = React.createClass({

	arrangeSlotPage: symfonyConfig.symfonyEnvironment + '/arrange-slot',

	componentDidMount () {

		cursors.slot.on('update', () => {

			var slot = shoppingCart.getSlot();

			if (slot.id){

				React.findDOMNode(this.refs.collection_slot_text).innerHTML = 'Collection slot reserved';
				React.findDOMNode(this.refs.collection_slot_icon).className = 'slot_reserved';
				React.findDOMNode(this.refs.slot_header_link_location).href = symfonyConfig.symfonyEnvironment + '/slot-confirmed';
			}
		});

    },

	render () {
        return (
        	<div className="mini-basket-link">
                <a id="selectSlot" tabIndex="3" ref="slot_header_link_location" href={this.arrangeSlotPage}>
                    <span>
                        <img className="mini_basket_header_img" src="/compiled/assets/img/icons/collection_slot_icon.png" />
                    </span>
                    <span ref="collection_slot_text">
                        Reserve a collection slot
                    </span>
                    <span ref="collection_slot_icon" className="slot_not_reserved"></span>
                </a>
            </div>
        );
    }
});

export default SlotHeader;
