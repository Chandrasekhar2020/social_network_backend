// src/resolvers/index.js
const resolvers = {
    Query: {
      hello: () => "Hello world!",
      getUsers: async () => {
        // Fetch users from Firebase Firestore
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return users;
      }
    }
  };
  
  module.exports = resolvers;
  