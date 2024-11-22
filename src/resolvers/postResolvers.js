const postService = require("../controllers/postController");
const admin = require('firebase-admin');

const postResolvers = {
  Query: {
    getPosts: async (parent, args, context) => {
      
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('Authentication token required');
      }

      try {
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
          throw new Error('Invalid token format');
        }

       
        const decodedToken = await admin.auth().verifyIdToken(token);
        context.user = decodedToken;
        
        return postService.getAllPosts(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },
    getPostById: async (parent, args, context) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('Authentication token required');
      }

      try {
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
          throw new Error('Invalid token format');
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        context.user = decodedToken;
        
        return postService.getPostById(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },
  },
  Mutation: {
    createPost: async (parent, args, context) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('Authentication token required');
      }

      try {
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
          throw new Error('Invalid token format');
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        context.user = decodedToken;
        
        return postService.createPost(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },

    updatePost: async (parent, args, context) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('Authentication token required');
      }

      try {
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
          throw new Error('Invalid token format');
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        context.user = decodedToken;
        
        return postService.updatePost(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },

    deletePost: async (parent, args, context) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        throw new Error('Authentication token required');
      }

      try {
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
          throw new Error('Invalid token format');
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        context.user = decodedToken;
        
        return postService.deletePost(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },
  },
};

module.exports = postResolvers; 
