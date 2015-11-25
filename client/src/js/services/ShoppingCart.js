'use strict';

import AppState from './../state/AppState.js';

let cursors = {
  basketItems: AppState.select('basket', 'items'),
  flash: AppState.select('basket', 'flash'),
  slot: AppState.select('basket', 'slot')
};

let shoppingCart = {

    addItem (item) {
        cursors.basketItems.unshift(item);
        cursors.flash = 0;
    },

    updateItemQuantity (item, increment) {

        var itemCursor, itemsArray, itemId;

        //var itemCursor = cursors.basketItems.select(this.getItems().indexOf(item));

        //this.getItems().indexOf(item) only works if on mini or main basket, else the index has to be retrieved manually
        if(this.getItems().indexOf(item) !== -1){
            itemCursor = AppState.select('basket', 'items', this.getItems().indexOf(item));
            itemCursor.set('quantity', item.quantity);
        } else {
            itemId = item.id;
            itemsArray = this.getItems();

            var itemIndex;

            for(var i = 0, j = itemsArray.length; i < j; i++){
                if(itemsArray[i].id === itemId){

                    if(increment){

                        itemIndex = i
                    }

                    itemCursor = AppState.select('basket', 'items', i);
                    itemCursor.set('quantity', item.quantity);
                    break;
                }
            }

            cursors.flash = itemIndex;
        }
    },

    removeItem (item) {
        cursors.flash = false;
        cursors.basketItems.splice([this.getItems().indexOf(item), 1]);
    },

    getItems () {
        cursors.flash = false;
        return cursors.basketItems.get()
    },

    addSlot (inputSlot) {
        AppState.select('basket', 'slot').merge(inputSlot);
    },

    getSlot () {
        return cursors.slot.get();
    }

};

export {cursors, shoppingCart};
