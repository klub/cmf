document.getElementById('hamburger_menu').onclick = function(event) {

	if (document.querySelector(".nav-container").style.left === "" || document.querySelector(".nav-container").style.left === "-1000px"){
		document.querySelector(".nav-container").style.left="0px";
	} else {
		document.querySelector(".nav-container").style.left="-1000px";
	}
};