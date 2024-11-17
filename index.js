const express = require('express');
const cors = require('cors');
const { ApolloServer } = require("apollo-server-express");
const authResolvers = require("./src/resolvers/authResolvers");
const authTypeDefs = require("./src/schema/authSchema");
const postTypeDefs = require('./src/schema/postSchema');
const postResolver = require('./src/resolvers/postResolvers');
const userResolver = require('./src/resolvers/userResolvers');
const userTypeDefs = require('./src/schema/userSchema');
const { db } = require("./src/config/firebase");

const app = express();
 

app.use(cors());
app.use(express.json());


const apolloServer = new ApolloServer({
  typeDefs: [authTypeDefs, postTypeDefs, userTypeDefs],
  resolvers: [authResolvers, postResolver, userResolver],
  context: ({ req }) => ({
    db,
    req
  }),
  introspection: true,
  playground: true
});

const startServer = async () => {
  try {
    await apolloServer.start();
    
    apolloServer.applyMiddleware({ 
      app,
      cors: false
    });
    
    const PORT = process.env.PORT || 4000;
    
    app.listen(PORT, () => {
      console.log(` GraphQL endpoint at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 
