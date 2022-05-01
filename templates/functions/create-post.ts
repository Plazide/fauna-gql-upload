/* 
	This file contains a user-defined function. You can create more user-defined functions by creating another file in the `functions/` directory and exporting a `FunctionResource`. Use the code below as a reference.

	TODO: Remember to remove this function before uploading to Fauna. It simply throws an error if it is called.
*/

import { query as q } from "faunadb";
import { FunctionResource } from "fauna-gql-upload";

// Create a new post (this function does not create a new post, it simply throws an error).
const createPost: FunctionResource = {
	name: "create-post",
	body: q.Query(
		q.Lambda(
			[],
			q.Abort("Function is not implemented.")
		)
	)
}

export default createPost;