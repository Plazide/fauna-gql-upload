/*
	This file contains a user-defined index. You can create more user-defined indexes by creating another file in the `indexes/` directory and exporting a `IndexResource`. Use the code below as a reference.

	TODO: Remember to remove this index before uploading to Fauna. It references a collection that might not exist in your schema, and will cause a reference error.
*/

import { query as q } from "faunadb";
import { IndexResource } from "fauna-gql-upload";

const userByEmail: IndexResource = {
	name: "user-by-email",
	source: q.Collection("User"),
	terms: [
		{ field: ["data", "email"] }
	]
};

export default userByEmail;