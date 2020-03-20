const express = require('express');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');

const db = require('./db');

const port = process.env.PORT || 4000;

const app = express();
app.use(cors());

const hateoas = require('./hateoas');

hateoas(app, port, db);

// throttle between 50 and 250ms
const DELAY = 50;
const JITTER = 200;
app.use('*', (req, res, next) =>
  setTimeout(next, DELAY + Math.floor(Math.random() * Math.floor(JITTER))),
);

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
    Authors() {
      return db.getAuthors();
    },
    Author(_, { id }) {
      return db.getAuthor(id);
    },
    Books() {
      return db.getBooks();
    },
    Book(_, { id }) {
      return db.getBook(id);
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

// this is called a tagged template
const typeDefs = /* GraphQL */ gql`
  type Query {
    Authors: [Author]
    Author(id: ID!): Author
    Books: [Book]
    Book(id: ID!): Book
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
  console.log('🏃 on', process.env.SANDBOX_URL || `http://localhost:${port}/`);
});
