// @ts-ignore
import { Expr } from "faunadb";

/** Options for resource uploads */
export interface UploadResourcesOptions{
	/** Whether or not to include roles in function upload */
	fnsWithRoles?: boolean;
}

export type ResourceType = "data" | "functions" | "roles" | "indexes" | "providers";
export type Resource = FunctionResource | RoleResource | IndexResource | DataResource;
export type StandardResourceType = "functions" | "roles" | "indexes" | "providers";
export type StandardResource = FunctionResource | RoleResource | IndexResource | ProviderResource;

/** A Role-predicate object specifies a Role to potentially evaluate, whose evaluation is determined by the specified predicate function */
interface RolePredicate{
	role: Expr;
	predicate: Expr;
}

/** Describes a source for an index.

More info https://docs.fauna.com/fauna/current/api/fql/indexes?lang=javascript#source
 */
export type IndexSource = Expr | {
	/** The collection or collections to be indexed, or a wildcard `(_)` */
	collection: Expr;

	/** An object mapping a binding’s name to a Lambda function.
	
More info https://docs.fauna.com/fauna/current/api/fql/indexes?lang=javascript#binding
	 */
	fields?: {
		[key: string]: Expr
	}
}

/** Describes a term for an index 
 
More info https://docs.fauna.com/fauna/current/api/fql/indexes?lang=javascript#term
*/
export interface IndexTerm{
	/** The path of the field within an document to be indexed */
	field: string[];

	/** The name of a binding from a `IndexSource` */
	binding?: string;
}

/** Describes value for an index 

More info https://docs.fauna.com/fauna/current/api/fql/indexes?lang=javascript#value
*/
export interface IndexValue{
	/** The path of the field within an document to be indexed */
	field: string[];

	/** The name of a binding from a `IndexSource` */
	binding?: string;

	/** Whether this field’s value should sort reversed */
	reverse?: boolean;
}

/** Describes privileges for a role */
export interface Privilege{
	/** The resource this privilege is applied to */
	resource: Expr;

	/** The actions this privilege allows/disallows */
	actions?: {
		/** Whether or not to allow creation of new documents */
		create?: Expr | boolean;

		/** Whether or not allow deletion of existing documents */
		delete?: Expr | boolean;

		/** Whether or not to allow reading of documents from collections of indexes */
		read?: Expr | boolean;

		/** Whether or not to allow writing to existing documents in a collection */
		write?: Expr | boolean;

		/** Whether or not to allow reading of historical versions of documents from collections or indexes */
		history_read?: Expr | boolean;

		/** Whether or not to allow insertion of events into the history for an existing document */
		history_write?: Expr | boolean;

		/** Whether or not to allow reading of an index without considering any other read permissions */
		unrestricted_read?: Expr | boolean;

		/** Whether or not to allow calling of user-defined functions */
		call?: Expr | boolean;
	}
}

/** Describes membership of a role */
export interface Membership{
	/** Collection where documents are members of the role */
	resource: Expr;

	/** Predicate function for dynamic membership evaluation */
	predicate?: Expr;
}

/** Describes common properties for all resource types */
export interface BaseResource{
	/** Name of resource */
	name: string;

	/** User-defined metadata for the resource */
	data?: { [key: string]: string | number | object }
}

/** Describes a function resource */
export interface FunctionResource extends BaseResource{
	/** The body of the function */
	body: Expr;

	/** The role that this function will assume, ie. `server` */
	role?: string | Expr
}

/** Describes an index resource.

More info https://docs.fauna.com/fauna/current/api/fql/indexes?lang=javascript
 */
export interface IndexResource extends BaseResource{
	/** Describe the source collection for this index */
	source: IndexSource;

	/** Describe the fields whose values are used to search for entries in the index. */
	terms?: IndexTerm[];

	/** Whether or not this index should be unique */
	unique?: boolean;

	/** Describe the fields that should be returned when searching the index */
	values?: IndexValue[];

	/** Whether or not writes to this index are serialized with concurrent reads and writes */
	serialized?: boolean;

	/** Indicates who is allowed to the index. Default is everyone */
	permissions?: { [key: string]: Expr | boolean }
}

/** Describes a role resource.
 
More info https://docs.fauna.com/fauna/current/security/abac?lang=javascript
 */
export interface RoleResource extends BaseResource{
	/** Tells FaunaDB which actions this role is allowed to perform on different collections */
	privileges: Privilege[];

	/** Tells FaunaDB which collection the `privileges` will be applied to, ie. `q.Collection("Users")` */
	membership?: Membership[];
}

/** Describes a domain data resource */
export interface DataResource{
	/** Name of collection to store data in */
	collection: string;

	/** Unique index for getting data in the collection  */
	index: string;

	/** The unique field in your collection that will determine if a document exists or not */
	key: string;

	/** The data to be inserted into your collection */
	data: { [key: string]: string | number | object }[]
}

/** Describes an access provider. 
 
More info at https://docs.fauna.com/fauna/current/api/fql/functions/createaccessprovider?lang=javascript */
export interface ProviderResource extends BaseResource{
	/** The domain of your access provider, ie. `https://<your-auth0-domain>.auth0.com` */
	issuer: string;

	/** Endpoint for your JSON Web Key Sets, ie. `https://<your-auth0-domain>.auth0.com/.well-known/jwks.json` */
	jwks_uri: string;

	/** Defines the roles that should be evaluated to determine access for a provided JWT token. */
	roles?: Expr[] | RolePredicate[];
}

/** Result of creating or getting an access provider */
export interface ProviderResult{
	/** The reference is an automatically-generated, unique identifier within the database to the AccessProvider that was created. */
	ref: Expr;

	/** The timestamp, with microsecond resolution, associated with the creation of the AccessProvider. */
	ts: number;

	/** The name for this AccessProvider. */
	name: string;

	/** The `issuer` value that was provided when creating the AccessProvider. */
	issuer: string;

	/** The `jwks_uri` value that was provided when creating the AccessProvider. */
	jwks_uri: string;

	/** A database-specific HTTP URI. Queries that should be authenticated using a JWT token should use this URI, instead of the default https://db.fauna.com/ successful login.

Every AccessProvider for the current database shares the same audience URI. */
	audience: string;

	/** Roles associated with the access provider */
	roles?: Expr[]
}

/** Options passed to the `upload` function */
export interface UploadOptions{
	/** Whether or note to override the schema. Default `false`. */
	override?: boolean;

	/** The resources to include in the upload. Default contains all supported resources. */
	resources?: (ResourceType | "schema")[]

	/** Whether or not to run code generation */
	runCodegen?: boolean;
}

export type Plugin = string | [string, Record<string, unknown>];