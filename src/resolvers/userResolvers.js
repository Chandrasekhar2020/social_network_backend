const userService = require("../controllers/userController");
const admin = require('firebase-admin');

const userResolvers = {
  Query: {
    getUserProfile: async (parent, args, context) => {
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
        
        return userService.getUserProfile(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },

    getUserFollowers: async (parent, args, context) => {
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
        
        return userService.getFollowers(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },

    getUserFollowing: async (parent, args, context) => {
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
        
        return userService.getFollowing(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },

    getFollowedUsersPosts: async (parent, args, context) => {
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
        
        return userService.getFollowedUsersPosts(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },
  },

  Mutation: {
    updateProfile: async (parent, args, context) => {
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
        
        return userService.updateProfile(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },

    followUser: async (parent, args, context) => {
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
        
        return userService.followUser(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },

    unfollowUser: async (parent, args, context) => {
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
        
        return userService.unfollowUser(parent, args, context);
      } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
      }
    },
  },
};

module.exports = userResolvers; 
