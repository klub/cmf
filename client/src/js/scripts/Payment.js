let payment = function(){
    // Script to disable backspace on payment page.
    // Dont worry it won't interfere with the payemnt iframe.
    document.body.onkeydown = function(e){

       var keycode;

       if (document.all) {
           // IE
           keycode = e.keyCode;
       } else {
           // Not IE
           keycode = e.which;
       }
       console.log(keycode);

       if (keycode == 8) {

          e.preventDefault();
          e.keyCode = 0;
       }
    };
};

export default payment;
