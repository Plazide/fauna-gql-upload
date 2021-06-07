function handleClick(e){
	const target = e.currentTarget;
	const parent = target.parentNode;
	const list = parent.querySelector(".list");

	if(list) {
		list.classList.toggle("closed");
		parent.classList.toggle("active")
	}
}

const dropdowns = document.querySelectorAll(".dropdown");
dropdowns.forEach( dropdown =>
	dropdown.querySelector(".dropdown-button").addEventListener("click", handleClick)
);

