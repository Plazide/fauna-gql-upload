import { Expr } from "faunadb";

export interface UploadResourcesOptions{
	fnsWithRoles?: boolean;
}

export type ResourceType = "data" | "functions" | "roles" | "indexes";
export type Resource = IFunctionResource | IRoleResource | IIndexResource | IDataResource;
export type StandardResourceType = "functions" | "roles" | "indexes";
export type StandardResource = IFunctionResource | IRoleResource | IIndexResource;

export type ISource = Expr | {
	collection: Expr;
	fields?: {
		[key: string]: Expr
	}
}

export interface ITerm{
	field: string[];
	binding?: string;
}

export interface IValue{
	field: string[];
	binding?: string;
	reverse?: boolean;
}

export interface IPrivilege{
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

export interface IMembership{
	resource: Expr;
	predicate?: Expr;
}

export interface IResource{
	name: string;
	data?: { [key: string]: string | number | object }
}

export interface IFunctionResource extends IResource{
	body: Expr;
	role?: string | Expr
}

export interface IIndexResource extends IResource{
	source: ISource;
	terms?: ITerm[];
	unique?: boolean;
	values?: IValue[];
	serialized?: boolean;
	permissions?: { [key: string]: Expr | boolean }
	data?: { [key: string]: string | number }
	role?: string | Expr
}

export interface IRoleResource extends IResource{
	privileges: IPrivilege[];
	membership: IMembership[];
}

export interface IDataResource{
	collection: string;
	index: string;
	key: string;
	data: { [key: string]: string | number | object }[]
}