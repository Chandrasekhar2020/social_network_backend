const { db } = require('../config/firebase');

const getUserProfile = async (uid) => {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }
  return userDoc.data();
};

module.exports = {
  getUserProfile
}; 
