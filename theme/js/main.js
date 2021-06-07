function toggleDropdown(e){
	const target = e.currentTarget;
	const parent = target.parentNode;
	const list = parent.querySelector(".list");

	if(list) {
		list.classList.toggle("closed");
		parent.classList.toggle("active")
	}
}


function toggleNavigation(){
	const navigation = document.querySelector(".nav");
	const display = navigation.style.display

	if(display === "flex"){
		navigation.style.display = "none"
	}else{
		navigation.style.display = "flex";
	}
}


const dropdowns = document.querySelectorAll(".dropdown");
dropdowns.forEach( dropdown =>
	dropdown.querySelector(".dropdown-button").addEventListener("click", toggleDropdown)
);

const hamburger = document.querySelector(".hamburger");
if(hamburger){
	hamburger.addEventListener("click", toggleNavigation)
}