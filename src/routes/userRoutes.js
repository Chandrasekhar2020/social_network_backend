const express = require('express');
const router = express.Router();
const { authenticateUser: auth } = require("../middlewares/authMiddleware");const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowedUsersPosts
} = require('../controllers/userController');

// Follow routes
router.post('/follow/:followingId', auth, followUser);
router.delete('/follow/:followingId', auth, unfollowUser);

// Get followers/following
router.get('/:userId/followers', auth, getFollowers);
router.get('/:userId/following', auth, getFollowing);

// Get feed of posts from followed users
router.get('/feed', auth, getFollowedUsersPosts);

module.exports = router; 
