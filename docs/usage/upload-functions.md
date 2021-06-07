# Upload functions

To upload functions, you need a to have a `fauna/functions` directory containing `.js` files that describe your function's name, role, and body. As mentioned earlier, it is possible to customize the functions path by adding a `fnsDir` property to the `.fauna.json` file.

For your functions to work, you need to `import "faunadb"` inside each of the function files, and use the functions inside `faunadb.query` to build your function. Take a look at the following example:
```js
import { query as q } from "faunadb";

export default {
  name: "current_user",
  body:
  q.Query(
    q.Lambda([], q.Let({ userRef: q.CurrentIdentity() }, q.Select([], q.Get(q.Var("userRef")))))
  )
};

```
This function would return the currently authenticated user. 

As you can see, you need to export an object containing the name of the function, as well as the body of the function. See the [Fauna documentation](https://docs.fauna.com/fauna/current/api/fql/functions/createfunction) for a full reference on the accepted properties.