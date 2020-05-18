module.exports = async function wait(time){
	return new Promise( resolve => {
		setTimeout(resolve, time);
	});
};
