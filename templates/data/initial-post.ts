/*
	This file contains domain data. This is data that will populate your database upon uploading your resources. You can create more domain data entries by creating another file in the `data/` directory and exporting a `DataResource`. Use the code below as a reference.

	TODO: Remember to remove this data before uploading to Fauna.
*/

import { DataResource } from "fauna-gql-upload";

const initialUser: DataResource = {
	collection: "User",

	// You need to create this index yourself. An example of this index exists in the `index/` folder.
	index: "user-by-email",
	key: "title",
	data: [
		{ name: "Admin", email: "admin@example.com" }
	]
}

export default initialUser;