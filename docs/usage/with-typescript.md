# With typescript

This package supports type-checking and automatic compilation of typescript files. All you need to do is change the file extension to `.ts`.

```js
import{ query as q } from "faunadb";
import { FunctionResource } from "fauna-gql-upload";

export default {
  name: "current_user",
  body:
  q.Query(
    q.Lambda([], q.Let({ userRef: q.Identity() }, q.Select([], q.Get(q.Var("userRef")))))
  )
} as FunctionResource;
```

## Configuration file

Fauna GQL Upload looks for a `tsconfig.json` file in the following order:

1. The file specified in `.fauna.json` under the `tsconfigPath` property.
2. The closest `tsconfig.json` to the current resource, ie. if you have a `tsconfig.json` in your functions directory, it will be used for your functions but not for other resources.
3. If the two previous checks return empty, the default compiler options will be used.


## Incremental adoption
If you've already started a project using `.js` files, you can just add new files with the `.ts` extension and Fauna GQL Upload will pick up both file extensions and treat them correctly.