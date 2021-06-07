# Upload roles

To upload roles, you need a `fauna/roles` directory containing a `.js` file for each of your roles. These files describe the role and look like the following example.

```js
import { query as q } from "faunadb";
import onlyDeleteByOwner from "../predicates/onlyDeleteByOwner";

export default {
  name: "user",
  privileges: [
    {
      resource: Collection("Comment"),
      actions: {
        read: true,
        create: true,
        delete: onlyDeleteByOwner
      }
    }
  ],
  membership: [
    {
      resource: q.Collection("User")
    }
  ]
}
```

Here, we create a role called `"user"` that is allowed to `read` and `create` comments, but only the owner of the comment can `delete` it. We use the the membership field to specify which collection the role will be attached to, in this case it is the `"User"` collection.

For more info on roles, see the [official documentation](https://docs.fauna.com/fauna/current/security/roles).

## Predicate functions
Another detail that you've probably noticed is the `onlyDeleteByOwner` function. This is a [predicate function](https://docs.fauna.com/fauna/current/security/roles#mco). It lets you define your own permissions based on the user making the request and the document's fields. You would normally have to write these inline with the permissions. But in this case, we can create these in separate files and reuse them multiple times for different resources.

The `onlyDeleteByOwner.js` file would like this:
```js
import { query as q } from "faunadb";

export default q.Query(
  q.Lambda(
    "ref",
    q.Equals(q.CurrentIdentity(), q.Select(["data", "user"], q.Get(q.Var("ref"))))
  )
);
```