const express = require('express');
const cors = require('cors');
const { ApolloServer } = require("apollo-server-express");
const authResolvers = require("./src/resolvers/authResolvers");
const typeDefs = require("./src/schema/typeDefs");
const postTypeDefs = require('./src/schema/postSchema');
const postResolver = require('./src/resolvers/postResolvers');
const { db } = require("./src/config/firebase");

const app = express();
 
// Middleware
app.use(cors());
app.use(express.json());

// Initialize Apollo Server
const apolloServer = new ApolloServer({
  typeDefs: [typeDefs, postTypeDefs],
  resolvers: [authResolvers, postResolver],
  context: ({ req }) => ({
    db,
    req
  }),
  introspection: true,
  playground: true
});

// Apply Apollo GraphQL middleware and start server
const startServer = async () => {
  try {
    await apolloServer.start();
    
    apolloServer.applyMiddleware({ 
      app,
      cors: false
    });
    
    const PORT = process.env.PORT || 4000;
    
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
      console.log(`📈 GraphQL endpoint at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 
