/* 
	From StackOverflow:
	https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
*/

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
		return index === 0 ? word.toLowerCase() : word.toUpperCase();
	}).replace(/\s+/g, "").replace(/(-|_)/g, "");
}

module.exports = camelize;