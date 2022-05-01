import { status } from "./logger";

export default function error(message: string) {
	status(message, "error");
	throw "An error ocurred. See above for details.";
}