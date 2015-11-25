/**
 * Central application state
 */

'use strict';

import Baobab from 'baobab';

//setup the initial app state
//could be after a server call a client side database, sessionStorage etc
let AppState = new Baobab({

    'basket': {
        'items': [],
        'flash' : false,
        'slot' : {}
    }

});

export default AppState;
