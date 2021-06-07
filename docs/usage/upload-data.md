# Upload data

To upload data, you need a `fauna/data` directory containing a `.js` file for each of your data definition sets. These files describe the data and look like the following example.

Data is idempotent, meaning multiple calls of the `fauna-gql` command will not yield duplicates. Documents that already exist (determined by the specified `key`) will be updated. This is why you must define a unique index and also specify which field to use for uniqueness with the `key` property.

```js
export default {
  collection: "Languages",
  index: "languages_by_key",
  key: "key",
  data: [
    { key: "en", name: "English" },
    { key: "es", name: "Spanish" },
    { key: "fr", name: "French" },
  ],
};

```

> **NOTE:** You need to create the index yourself. See [Uploading indexes](/usage/upload-indexes) for more info.

## Adding credentials to your data

You can attach credentials to your data. This is useful for, among other things, creating initial admin users. Simply create a `credentials` field and specify which piece of data the credentials will be attached to.

```js
export default {
  collection: "Admin",
  index: "admin_by_email",
  key: "email",
  data: [
    { email: "carl@chjweb.se", name: "chjweb" }
  ],
  credentials: [
    { 
      key: "carl@chjweb.se", 
      password: "VerySecurePassword" 
    }
  ]
}
```

Here, we say that the `key` for our data is the `email` field. In the `credentials` field, we say that we are looking for a `key` with a value of `"carl@chjweb.se"` and want to assign the password to the corresponding data entry.

You can then use the FQL `Login()` function to get an access key for the admin user, like so:

```js
Login(
  Match(
    Index("admin_by_email"), 
    "carl@chjweb.se"
  ), 
  { 
    password: "VerySecurePassword" 
  }
)
```

You would also need to create a role and specify the `Admin` collection in the membership field. See [Uploading roles](/usage/upload-roles) for more info.