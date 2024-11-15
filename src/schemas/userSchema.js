const userSchema = {
    displayName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    // Add any additional user fields here
  };
  
  
  
  module.exports = {
    userSchema
    
  };
