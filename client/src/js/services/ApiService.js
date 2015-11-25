import React from 'react';
import Request from '../../../node_modules/superagent/lib/client';
import q from '../../../node_modules/q/q';
import legacyIESupport from '../../../node_modules/superagent-legacyiesupport/superagent-legacyIESupport';

class ApiService {

    createBasket(obj){

        var deferred = q.defer();
        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/basket';

        Request
            .post(apiUrl)
            .send(obj)
            .end(function(err, res){
                if (err) {
                    deferred.reject(err);
                    //provide error message to user
                } else {
                    deferred.resolve(res);
                }
            });

        return deferred.promise;
    }

    getCategoryData(category){
        var deferred = q.defer();
        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/category/' + category + '/product';
        console.log(apiUrl);

        Request
            .get(apiUrl)
            .end(function(err, res) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(res);

                }
            });
        return deferred.promise;
    }

    getBasketData(id){

        var deferred = q.defer();
        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/basket/' + id;

        Request
            .get(apiUrl)
            .end(function(err, res){
                if (err) {
                    deferred.reject(err);
                    //provide error message to user
                } else {
                    deferred.resolve(res);
                }
            });

        return deferred.promise;
    }

    addItem(id, obj){

        var deferred = q.defer();
        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/basket/' + id + '/item';

        Request
            .post(apiUrl)
            .send(obj)
            .end(function(err, res){
                if (err) {
                    deferred.reject(err);
                    //provide error message to user
                } else {
                    deferred.resolve(res);
                }
            });

        return deferred.promise;
    }

    updateItem(basketId, obj){

        var deferred = q.defer();

        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/basket/' + basketId + '/sku/' + obj.sku;

        Request
            .patch(apiUrl)
            .send(obj)
            .end(function(err, res){
                if (err) {
                    deferred.reject(err);
                    //provide error message to user
                } else {
                    deferred.resolve(res);
                }
            });

        return deferred.promise;
    }

    removeItem(basketId, itemId){

        var deferred = q.defer();
        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/basket/' + basketId + '/item/' + itemId;

        Request
            .del(apiUrl)
            .end(function(err, res){
                if (err) {
                    deferred.reject(err);
                    //provide error message to user
                } else {
                    deferred.resolve(res);
                }
            });

        return deferred.promise;
    }

    getProductData(parentSku){

        var deferred = q.defer();
        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/product/' + parentSku;

        Request
            .get(apiUrl)
            .end(function(err, res) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(res);

                }
            });
        return deferred.promise;
    }

    updateOrder(){
        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/amending-order';
        return Request.post(apiUrl);
    }

    confirmAmend(orderID){
        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/amending-order/' + orderID + '/confirm';
        return Request.post(apiUrl);
    }

    cancelAmend(orderID){
        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/amending-order/' + orderID;
        return Request.del(apiUrl);
    }

    confirmSlotSelection(store, date, hour){
        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/slot/' + store + '?date=' + date + '&hour=' + hour;
        return Request.get(apiUrl).set('Accept', 'application/json');
    }

    addSlotToBasket(basketId, store, date, hour){
        const apiUrl = symfonyConfig.symfonyEnvironment +'/api/basket/' + basketId + '/slot';
        return Request.post(apiUrl).send('{"store_code":"' + store + '", "date":"' + date + '", "hour":"' + hour + '"}');
    }

    getStoreDetails(storeCode){
        const apiUrl = symfonyConfig.baseUrl + '/stores/' + storeCode;
        return Request.get(apiUrl).use(legacyIESupport);
    }

    callStoreLocatorAPI(searchQuery){
        const apiUrl = symfonyConfig.baseUrl + '/stores?' + searchQuery + '&sort=by_distance&within=1000&limit=5&facilities=%5B"Christmas%20Ordering"%5D';
        return Request.get(apiUrl).use(legacyIESupport);
    }

    getCurrentStoreSlots(storeId){
        const apiUrl = symfonyConfig.symfonyEnvironment + '/api/slot/' + storeId;
        return Request.get(apiUrl);
    }
}

export default ApiService;
