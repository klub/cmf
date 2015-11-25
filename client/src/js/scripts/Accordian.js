let Accordian = (function(){
	
	var products = document.querySelectorAll('.accordian');

	for (var i = 0; i < products.length; i++) {

		var product  = products[i],
			openBtn  = product.querySelector('.open-accordian'),
			closeBtn = product.querySelector('.close-accordian');
	    
	    openBtn.addEventListener('click', open.bind(null,i));
	    closeBtn.addEventListener('click',close.bind(null,i));
	}

	function open (index) {
		products[index].className = "container nutrition accordian open"
	}

	function close (index) {
		products[index].className = "container nutrition accordian"
	}

})

export default Accordian;
