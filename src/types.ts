// @ts-ignore
import { Expr } from "faunadb";

export interface UploadResourcesOptions{
	fnsWithRoles?: boolean;
}

export type ResourceType = "data" | "functions" | "roles" | "indexes" | "providers";
export type Resource = FunctionResource | RoleResource | IndexResource | DataResource;
export type StandardResourceType = "functions" | "roles" | "indexes" | "providers";
export type StandardResource = FunctionResource | RoleResource | IndexResource | ProviderResource;

export type IndexSource = Expr | {
	collection: Expr;
	fields?: {
		[key: string]: Expr
	}
}

export interface IndexTerm{
	field: string[];
	binding?: string;
}

export interface IndexValue{
	field: string[];
	binding?: string;
	reverse?: boolean;
}

export interface Privilege{
	resource: Expr;
	actions?: {
		create?: Expr | boolean;
		delete?: Expr | boolean;
		read?: Expr | boolean;
		write?: Expr | boolean;
		history_read?: Expr | boolean;
		history_write?: Expr | boolean;
		unrestricted_read?: Expr | boolean;
		call?: Expr | boolean;
	}
}

export interface Membership{
	resource: Expr;
	predicate?: Expr;
}

export interface BaseResource{
	name: string;
	// data?: { [key: string]: string | number | object }
}

export interface FunctionResource extends BaseResource{
	body: Expr;
	role?: string | Expr
}

export interface IndexResource extends BaseResource{
	source: IndexSource;
	terms?: IndexTerm[];
	unique?: boolean;
	values?: IndexValue[];
	serialized?: boolean;
	permissions?: { [key: string]: Expr | boolean }
	data?: { [key: string]: string | number }
	role?: string | Expr
}

export interface RoleResource extends BaseResource{
	privileges: Privilege[];
	membership: Membership[];
}

export interface DataResource{
	collection: string;
	index: string;
	key: string;
	data: { [key: string]: string | number | object }[]
}

export interface ProviderResource extends BaseResource{
	issuer: string;
	jwks_uri: string;
	roles?: Expr[] | string[];
	data?: { [key: string]: string | number }
}

export interface ProviderResult{
	ref: Expr;
	ts: number;
	name: string;
	issuer: string;
	jwks_uri: string;
	audience: string;
	roles: Expr[]
}

export interface UploadOptions{
	override?: boolean;
	resources?: (ResourceType | "schema")[]
	runCodegen?: boolean;
}

export type Plugin = string | [string, Record<string, unknown>];