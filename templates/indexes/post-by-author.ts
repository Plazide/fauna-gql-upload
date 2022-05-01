/* 
	This file contains a custom index. You can create more custom indexes by creating another file in the `indexes/` directory and exporting a `IndexResource`. Use the code below as a reference.

	TODO: Remember to remove this index before uploading to Fauna. It references a collection that might not exist in your schema, and will cause a reference error.
*/

import { query as q } from "faunadb"
import { IndexResource } from "fauna-gql-upload"

// Find posts by the author ref.
const postByAuthor: IndexResource = {
	name: "post-by-author",
	source: q.Collection("Post"),
	terms: [
		{ field: ["data", "author"] }
	]
}

export default postByAuthor;