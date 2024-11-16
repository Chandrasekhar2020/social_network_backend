const authService = require("../controllers/authController");

const authResolvers = {
  Query: {
    _empty: () => ''
  },
  Mutation: {
    signup: async (_, args) => {
      try {
        return await authService.signup(args);
      } catch (error) {
        throw new Error(error.message);
      }
    },

    login: async (_, args) => {
      try {
        return await authService.login(args);
      } catch (error) {
        throw new Error(error.message);
      }
    },

    forgotPassword: async (_, args) => {
      try {
        return await authService.forgotPassword(args);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};

module.exports = authResolvers; 
