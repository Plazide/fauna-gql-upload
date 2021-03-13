// @ts-ignore
import { errors } from "faunadb";
import { ResourceType } from "../types";

type Status = "success" | "error" | "info";

export function status(message: string, status: Status = "info"){
	const composedMessage = getMessage(message, status);

	switch(status){
		case "error":
			console.error(composedMessage);
			break;
		case "success":
			console.log(composedMessage);
			break;
		case "info":
			console.info(composedMessage);
			break;
	}
}

export function detailedError(err: errors.FaunaHTTPError, type: ResourceType){
	if (err.requestResult) {
		const response = JSON.parse(err.requestResult.responseRaw);
		const errors = response.errors;

		console.group(getMessage(`Error uploading ${type}`, "error"));
		for(let error of errors){
			const failures = error.failures;
			const position = error.position;
		
			console.group(bright(`${error.code}: ${error.description}`));
			if(failures){
				for(let fail of failures){
					console.log(dimmed(`${fail.code}: ${fail.description}`));
					console.log(dimmed(`field: ${fail.field}`));
				}				
			}

			if(position){
				console.log(dimmed(`position: ${position}`));
			}
			console.groupEnd();
		}
		console.groupEnd();
	} else {
		throw err;
	}
}

function getMessage(message: string, status: Status){
	const dim = "\x1b[2m";
	const bright = "\x1b[1m";
	const reset = "\x1b[0m";
	const color = getColor(status);
	const composedMessage = `${dim}${color}[${status}]${reset} ${bright}${message}${reset}`;

	return composedMessage;
}

function dimmed(message: string){
	const dim = "\x1b[2m";
	const reset = "\x1b[0m";

	return `${dim}${message}${reset}`;

	
}

function bright(message: string){
	const bright = "\x1b[1m";
	const reset = "\x1b[0m";

	return `${bright}${message}${reset}`;
}

function getColor(status: Status){
	switch(status){
		case "error":
			return "\x1b[31m";
		case "success":
			return "\x1b[32m";
		case "info": 
			return "\x1b[34m";
	}
}