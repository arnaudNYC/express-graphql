# express-graphql

A simple project exposing rest and graphql endpoints

## Sample GraphQL query

The id is now optional.

```
query {
  Authors(id: 3) {
    id
    name
    books {
      title
    }
  }
  Books {
    id
    title
    author {
      name
    }
  }
}
```
