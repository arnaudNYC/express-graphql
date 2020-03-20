module.exports = (app, port, db) => {
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
};
