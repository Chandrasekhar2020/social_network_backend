const express = require('express');
const cors = require('cors');
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./src/schemas/typeDefs");
const resolvers = require("./src/resolvers");
const { db } = require("./src/config/firebase");
const authRoutes = require('./src/routes/authRoutes');
const postRoutes = require('./src/routes/postRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
 
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (_, res) => {
  res.send('Welcome to the Social Network API');
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize Apollo Server with type definitions and resolvers
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    db,
    req
  })
});

// Apply Apollo GraphQL middleware and start server
const startServer = async () => {
  try {
    await apolloServer.start();
    
    apolloServer.applyMiddleware({ 
      app, 
      path: '/graphql' 
    });
    
    const PORT = process.env.PORT || 4000;
    
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
      console.log(`📈 GraphQL endpoint at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 
