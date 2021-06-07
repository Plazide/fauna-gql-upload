# Upload indexes

To upload indexes, you need a `fauna/indexes` directory containing a `.js` file for each of your indexes. These files describe the index and look like the following example.

```js
import { query as q } from "faunadb";

export default {
  name: "people_sort_by_age_asc",
  source: q.Collection("People"),
  values: [
    { field: ["data", "age"] },
    { field: ["ref"] }
  ]
}
```

Fauna does actually create indexes based on your schema. But in certain situations it might be necessary to create custom indexes. The index above sorts people in ascending order by their age.

## Be careful when updating `terms` or `values`

FaunaDB does not allow you to update the `terms` and `values` fields. Attempting to do this will result in an error. Fauna GQL Upload solves this. 

As of version 2.2.0, Fauna GQL Upload deletes the indexes, waits 60 seconds, and uploads them again whenever an `"invalid document data"` error occurs on an index. This makes updating indexes convenient when using Fauna GQL Upload, but it comes with one potential downside.

Because indexes are removed and can't be uploaded again until the cache has cleared, which is 60 seconds, there is a 1 minute window where you will get `"invalid ref"` errors if you try to access the indexes. That means your application wouldn't function properly during this time.

Indexes should therefore be carefully considered before being pushed to production, since they can't be updated without downtime.