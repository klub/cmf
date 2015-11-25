// Accessabilty behaviour for skip to main content link in header.	
let Skip = function(){

	var Skipper     = document.getElementById('skip-link'),
		maincontent = document.getElementById('maincontent');  

	Skipper.addEventListener('click', function(){
		maincontent.setAttribute("tabindex", "-1")
		maincontent.focus();
	});
}

export default Skip;