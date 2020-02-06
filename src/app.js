const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// HATEOAS
const getUrl = (req, uri) => {
  const { SANDBOX_URL } = process.env;
  if (SANDBOX_URL) {
    return `${SANDBOX_URL}${uri}`;
  }
  return `${req.protocol}://${req.hostname}:${port}/${uri}`;
};
app.get('/', (req, res) =>
  res.json({
    links: {
      graphql: `${getUrl(req, 'graphql')}`,
      rest: `${getUrl(req, 'api')}`,
    },
  }),
);
app.get('/api', (req, res) => {
  const root = `${getUrl(req, 'api')}`;
  res.json({
    links: {
      authors: `${root}/authors`,
      books: `${root}/books/`,
    },
    authors: db.getAuthors().map(author => ({
      ...author,
      links: {
        details: `${root}/authors/${author.id}`,
        books: `${root}/authors/${author.id}/books`,
      },
    })),
    books: db.getBooks().map(book => ({
      ...book,
      links: {
        details: `${root}/books/${book.id}`,
        author: `${root}/books/${book.id}/author`,
      },
    })),
  });
});

// REST route for authors
const authorRouter = express.Router();
app.use('/api/authors', authorRouter);

authorRouter.route('/').get((req, res) => res.json(db.getAuthors()));
authorRouter
  .route('/:authorId')
  .get((req, res) => res.json(db.getAuthor(req.params.authorId)));
authorRouter
  .route('/:authorId/books')
  .get((req, res) => res.json(db.getAuthorBooks(req.params.authorId)));

// REST route for books
const bookRouter = express.Router();
app.use('/api/books', bookRouter);

bookRouter.route('/').get((req, res) => res.json(db.getBooks()));
bookRouter
  .route('/:bookId')
  .get((req, res) => res.json(db.getBook(req.params.bookId)));
bookRouter
  .route('/:bookId/author')
  .get((req, res) => res.json(db.getBookAuthor(req.params.bookId)));

// GraphQL
const resolvers = {
  Query: {
    Authors(_, { id }) {
      if (id) {
        return [].concat(db.getAuthor(id));
      }
      return db.getAuthors();
    },
    Books(_, { id }) {
      if (id) {
        return [].concat(db.getBook(id));
      }
      return db.getBooks();
    },
  },
  Author: {
    books(author) {
      return db.getAuthorBooks(author.id);
    },
  },
  Book: {
    author(book) {
      return db.getAuthor(book.authorId);
    },
  },
};

const typeDefs = /* GraphQL */ gql`
  type Query {
    Authors(id: ID): [Author]
    Books(id: ID): [Book]
  }

  type Author {
    id: ID!
    name: String
  }

  type Book {
    id: ID!
    title: String
  }

  extend type Author {
    books: [Book]
  }

  extend type Book {
    author: Author
  }
`;

const server = new ApolloServer({
  resolvers,
  tracing: (process.env.NODE_ENV = 'development'),
  typeDefs,
});
server.applyMiddleware({ app });

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(
    'Running on',
    process.env.SANDBOX_URL || `http://localhost:${port}/`,
  );
});
