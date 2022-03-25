// To serve up react frontend code in production
const path = require('path');

const express = require('express');

// Import Apollo server
const { ApolloServer } = require('apollo-server-express');

// Import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');

// Import the middleware function
const { authMiddleware } = require('./utils/auth');

// Import connection data to DB
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

// Prep startServer so the server can start
const startServer = async () => {
  // Create a new apollo server and pass in the schema data
  const server = new ApolloServer ({
    typeDefs,
    resolvers,
    // "context" is used to set what is passed via the context param in resolvers
    // In this case, it's set to take in an auth token
    // authMiddleware is a function that reads & verifies the token in a user's API request
    context: authMiddleware 
  });

  // Start the apollo server
  await server.start();

  // integrate our Apollo server with the Express application as middleware
  server.applyMiddleware({ app });

  // log where we can go to test our GQL API
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};

// Start the apollo server
startServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve up static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
