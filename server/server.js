const express = require('express');

// Import Apollo server
const { ApolloServer } = require('apollo-server-express');

// Import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');

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
    //context: authMiddleware
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

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
