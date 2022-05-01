/*
	This file contains a user-defined role. You can create more user-defined roles by creating another file in the `roles/` directory and exporting a `RoleResource`. Use the code below as a reference.

	TODO: Remember to remove this role before uploading to Fauna. It would throw an error if the Post collections doesn't exist in your schema.
*/

import { query as q } from "faunadb"
import { RoleResource } from "fauna-gql-upload"

const user: RoleResource = {
	name: "user",
	privileges: [
		{ 
			resource: q.Collection("Post"),
			actions: {
				read: true
			} 
		}
	]
}

export default user;