# express-graphql

A simple project exposing rest and graphql endpoints

## Sample GraphQL query

```
query {
  Authors {
    id
    name
    books {
      title
    }
  }
  Author(id: 2) {
    id
    name
  }
  Books {
    id
    title
  }
  Book(id: 10) {
    id
    title
    author {
      name
    }
  }
}
```
